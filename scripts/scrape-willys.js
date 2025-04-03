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
    
    console.log(`Extracting price from: ${priceText}`);
    
    // Handle "X för Y kr" format
    const forMatch = priceText.match(/(\d+)\s+för\s+(\d+(?:[,.]\d+)?)/i);
    if (forMatch) {
        const quantity = forMatch[1];
        const totalPrice = forMatch[2];
        const format = `${quantity} för ${totalPrice}`;
        console.log(`Found "för" format: ${format}`);
        return {
            price: format,
            format: null
        };
    }
    
    // Handle "X st Y kr" format
    const stPriceMatch = priceText.match(/(\d+)\s+st\s+(\d+(?:[,.]\d+)?)/i);
    if (stPriceMatch) {
        const quantity = stPriceMatch[1];
        const totalPrice = stPriceMatch[2];
        const format = `${quantity} st ${totalPrice}`;
        console.log(`Found "st" format: ${format}`);
        return {
            price: format,
            format: null
        };
    }
    
    // Handle "X kr/frp" format
    const frpMatch = priceText.match(/(\d+(?:[,.]\d+)?)\s*\/frp/i);
    if (frpMatch) {
        const frpPrice = frpMatch[1];
        console.log(`Found "kr/frp" format: ${frpPrice} kr/frp`);
        return {
            price: `${frpPrice} kr/frp`,
            format: null
        };
    }
    
    // Handle "X kr/st" format
    const stMatch = priceText.match(/(\d+(?:[,.]\d+)?)\s*\/st/i);
    if (stMatch) {
        const stPrice = stMatch[1];
        console.log(`Found "kr/st" format: ${stPrice} kr/st`);
        return {
            price: `${stPrice} kr/st`,
            format: null
        };
    }
    
    // Handle "X kr/kg" format
    const kgMatch = priceText.match(/(\d+(?:[,.]\d+)?)\s*\/kg/i);
    if (kgMatch) {
        const kgPrice = kgMatch[1];
        console.log(`Found "kr/kg" format: ${kgPrice} kr/kg`);
        return {
            price: `${kgPrice} kr/kg`,
            format: null
        };
    }
    
    // Handle simple "X kr" format
    const simpleMatch = priceText.match(/(\d+(?:[,.]\d+)?)\s*kr(?!\s*\/)/i);
    if (simpleMatch) {
        const simplePrice = simpleMatch[1];
        console.log(`Found simple format: ${simplePrice} kr`);
        return {
            price: `${simplePrice} kr`,
            format: null
        };
    }
    
    // Handle basic price format (just numbers)
    const basicMatch = priceText.match(/(\d+(?:[,.]\d+)?)/);
    if (basicMatch) {
        const basicPrice = basicMatch[1];
        console.log(`Found basic format: ${basicPrice}`);
        return {
            price: basicPrice,
            format: null
        };
    }
    
    console.log(`No price format matched for: ${priceText}`);
    return {
        price: null,
        format: null
    };
}

// Helper function to format price text
function formatPriceText(priceText) {
    if (!priceText) return '';
    return priceText;
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
            // Extract price using the extractPrice function
            const { price, format } = extractPrice(product.price);
            console.log(`Product: ${product.name}, Raw price text: ${product.price}, Extracted price: ${price}, Format: ${format}`);
            
            // Map to products table schema
            return {
                product_name: product.name,
                description: product.brand,
                price: price,
                original_price: null,
                image_url: null,
                product_url: null,
                offer_details: cleanText(product.additional_info) + 
                    (product.additional_info ? '<br>' : '') + 
                    (format ? format : formatPriceText(product.price)),
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