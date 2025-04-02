require('dotenv').config();
const puppeteer = require('puppeteer');
const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// Helper function to clean text
function cleanText(text) {
    if (!text) return '';
    return text
        .replace(/\s+/g, ' ') // Replace multiple spaces/newlines with single space
        .replace(/\s*\n\s*/g, ' ') // Replace newlines with space
        .trim(); // Remove leading/trailing whitespace
}

// Helper function to extract numeric price
function extractPrice(priceText) {
    if (!priceText) return null;
    const match = priceText.match(/(\d+(?:,\d+)?)/);
    if (match) {
        return parseFloat(match[1].replace(',', '.'));
    }
    return null;
}

async function scrapeWillysProducts() {
    console.log('Starting Willys Johanneberg product scraping...');
    
    const browser = await puppeteer.launch({
        headless: 'new',
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    try {
        const page = await browser.newPage();
        await page.goto('https://web.matpriskollen.se/Offer/ByStore/10d005ae-57c6-4005-aacd-1adb859fabbf', {
            waitUntil: 'networkidle0',
            timeout: 60000
        });

        // Wait for the product list to load
        await page.waitForSelector('table');

        // Extract products by category
        const products = await page.evaluate(() => {
            const results = [];
            const cards = document.querySelectorAll('.card');
            
            cards.forEach(card => {
                const categoryHeader = card.querySelector('h5.card-header');
                if (!categoryHeader) return;
                
                const category = categoryHeader.textContent.trim();
                const rows = card.querySelectorAll('tr.list-inline');
                
                rows.forEach(row => {
                    const nameCell = row.querySelector('.offerlist__td_article');
                    const unitCell = row.querySelector('.offerlist__td_volume');
                    const priceCell = row.querySelector('.offerlist__td_price');
                    const brandElement = row.querySelector('.text-muted');
                    
                    if (nameCell && unitCell && priceCell) {
                        const name = nameCell.childNodes[0].textContent.trim();
                        const unit = unitCell.textContent.trim();
                        const priceText = priceCell.textContent.trim();
                        const brand = brandElement ? brandElement.textContent.trim() : '';
                        const isKortvara = nameCell.textContent.includes('Kortvara!');
                        
                        // Extract additional info from tooltip
                        const infoElement = row.querySelector('.offerlist__td_info a');
                        const additionalInfo = infoElement ? infoElement.getAttribute('data-bs-content') : '';
                        
                        results.push({
                            name,
                            price: priceText,
                            unit,
                            category,
                            brand,
                            is_kortvara: isKortvara,
                            additional_info: additionalInfo
                        });
                    }
                });
            });
            
            return results;
        });

        console.log(`Found ${products.length} products`);

        // First, clear existing products to avoid duplication
        console.log("Clearing existing products from products table");
        
        // Clear existing products but keep system rows if any
        const { error: deleteError } = await supabase
            .from('products')
            .delete()
            .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all but keep the table structure
        
        if (deleteError) {
            console.error("Error clearing existing products:", deleteError);
            console.error("Error details:", JSON.stringify(deleteError));
            // Continue anyway to insert new products
        } else {
            console.log("Successfully cleared existing products");
        }
        
        // Prepare the data for products table format
        const validProducts = products.filter(product => {
            // Basic validation
            if (!product.name) {
                console.warn("Product missing name:", product);
                return false;
            }
            
            return true;
        }).map((product, index) => {
            // Map to products table schema
            return {
                product_name: product.name,
                description: product.brand,
                price: extractPrice(product.price),
                original_price: null,
                image_url: null,
                product_url: null,
                offer_details: cleanText(product.additional_info),
                label: product.is_kortvara ? 'Kortvara' : null,
                savings: null,
                unit_price: cleanText(product.unit),
                purchase_limit: null,
                store: 'Willys',
                store_location: 'Johanneberg',
                position: index + 1
            };
        });
        
        if (validProducts.length !== products.length) {
            console.log(`Filtered out ${products.length - validProducts.length} invalid products`);
        }
        
        console.log(`Storing ${validProducts.length} valid products in Supabase products table`);
        console.log("First product example:", JSON.stringify(validProducts[0]));
        
        // Try inserting a single product first to test
        console.log("Testing insertion with first product");
        const { data: testData, error: testError } = await supabase
            .from('products')
            .insert([validProducts[0]])
            .select();

        // Insert new products
        const { error: insertError } = await supabase
            .from('products')
            .insert(validProducts);

        if (insertError) {
            throw insertError;
        }

        console.log('Successfully updated products in the database');
        
    } catch (error) {
        console.error('Error during scraping:', error);
        throw error;
    } finally {
        await browser.close();
    }
}

// Run the scraping function
scrapeWillysProducts()
    .then(() => {
        console.log('Scraping completed successfully');
        process.exit(0);
    })
    .catch(error => {
        console.error('Scraping failed:', error);
        process.exit(1);
    }); 