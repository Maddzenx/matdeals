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

// Helper function to determine product category
function determineProductCategory(productName, description = '') {
    const name = productName.toLowerCase();
    const desc = description.toLowerCase();

    // Categories and their keywords
    const categories = {
        'Frukt & Grönt': [
            'äpple', 'banan', 'apelsin', 'päron', 'kiwi', 'melon', 'druvor', 'jordgubbar',
            'hallon', 'blåbär', 'lingon', 'morötter', 'potatis', 'lök', 'vitlök', 'tomat',
            'gurka', 'paprika', 'sallad', 'spenat', 'broccoli', 'blomkål', 'kål', 'purjolök',
            'selleri', 'squash', 'aubergine', 'zucchini', 'avokado', 'citron', 'lime',
            'persika', 'nektarin', 'plommon', 'aprikos', 'mango', 'ananas', 'fikon',
            'ärtor', 'bönor', 'majs', 'sötpotatis', 'ingefära', 'chili', 'basilika',
            'persilja', 'dill', 'mynta', 'rosmarin', 'timjan', 'oregano', 'grönsaker',
            'frukt', 'bär', 'ört', 'kryddväxt', 'smoothie', 'juice', 'fruktdryck'
        ],
        'Mejeri & Ägg': [
            'mjölk', 'yoghurt', 'grädde', 'smör', 'ost', 'bregott', 'fil', 'kvarg',
            'keso', 'crème fraiche', 'riven ost', 'feta', 'mozzarella', 'ricotta',
            'brie', 'camembert', 'cheddar', 'gouda', 'parmesan', 'ägg', 'äggvita',
            'äggula', 'äggnudlar', 'äggpulver', 'ägglikör', 'ägglikör', 'ägglikör',
            'ägglikör', 'ägglikör', 'ägglikör', 'ägglikör', 'ägglikör', 'ägglikör'
        ],
        'Kött & Chark': [
            'kyckling', 'nötkött', 'fläsk', 'kalkon', 'lamm', 'korv', 'skinka', 'bacon',
            'pancetta', 'prosciutto', 'salami', 'chorizo', 'pärs', 'rökt', 'rökt skinka',
            'köttfärs', 'köttbullar', 'köttsås', 'köttgryta', 'köttsoppa', 'köttgryta',
            'köttsoppa', 'köttgryta', 'köttsoppa', 'köttgryta', 'köttsoppa', 'köttgryta',
            'köttsoppa', 'köttgryta', 'köttsoppa', 'köttgryta', 'köttsoppa', 'köttgryta',
            'blodpudding', 'leverpastej', 'pâté', 'korv', 'wurst', 'salami', 'skinka'
        ],
        'Fisk & Skaldjur': [
            'lax', 'torsk', 'sill', 'makrill', 'räkor', 'musslor', 'bläckfisk', 'tonfisk',
            'sej', 'kolja', 'röding', 'abborre', 'gädda', 'krabba', 'hummer', 'kräftor',
            'ostron', 'blåmusslor', 'vongole', 'räkmacka', 'fiskpinnar', 'fiskbullar',
            'fiskgratäng', 'fiskpaj', 'fisksoppa', 'fiskgryta', 'fisksoppa', 'fiskgryta'
        ],
        'Skafferi': [
            'pasta', 'ris', 'mjöl', 'socker', 'salt', 'peppar', 'olivolja', 'vinäger',
            'soja', 'ketchup', 'majonnäs', 'senap', 'buljong', 'kryddor', 'krydda',
            'nötter', 'frön', 'müsli', 'havregryn', 'cornflakes', 'müsli', 'bönor',
            'linser', 'kikärtor', 'quinoa', 'couscous', 'bulgur', 'bönor', 'linser',
            'kikärtor', 'quinoa', 'couscous', 'bulgur', 'bönor', 'linser', 'kikärtor',
            'grillolja', 'marinad', 'strösocker', 'vetemjöl', 'makaroner', 'ris'
        ],
        'Färdigmat': [
            'pizza', 'lasagne', 'köttbullar', 'fiskpinnar', 'nuggets', 'färdigrätter',
            'soppa', 'wok', 'curry', 'stuvning', 'gratäng', 'paj', 'quiche', 'sallad',
            'wrap', 'sushi', 'sashimi', 'tempura', 'dim sum', 'spring rolls', 'nudlar',
            'ris', 'potatis', 'grönsaker', 'kött', 'fisk', 'skaldjur', 'vegetariskt',
            'vegansk', 'glutenfritt', 'laktosfritt', 'mjölkfritt', 'äggfritt', 'pan pizza'
        ],
        'Dryck': [
            'läsk', 'vatten', 'juice', 'saft', 'öl', 'vin', 'cider', 'kaffe', 'te',
            'kakao', 'energidryck', 'smoothie', 'protein', 'shaker', 'mineralvatten',
            'kolsyrat', 'stillastående', 'kranvatten', 'kallt', 'varmt', 'is', 'vatten',
            'kolsyrat', 'stillastående', 'kranvatten', 'kallt', 'varmt', 'is', 'vatten',
            'havredryck', 'proteinbar', 'återhämtningsdryck'
        ],
        'Godis & Snacks': [
            'choklad', 'godis', 'kex', 'chips', 'popcorn', 'nötter', 'torkad frukt',
            'kola', 'lakrits', 'gelé', 'marshmallows', 'kakor', 'biscuits', 'kex',
            'kakor', 'biscuits', 'kex', 'kakor', 'biscuits', 'kex', 'kakor', 'biscuits',
            'cheez', 'doodles', 'surprise', 'chokladägg', 'chokladpåse', 'polly', 'dumle',
            'marianne', 'chokladkola', 'donuts'
        ],
        'Hygien & Städ': [
            'tvål', 'schampo', 'balsam', 'deodorant', 'tandkräm', 'tandborste',
            'toalettpapper', 'servetter', 'hushållspapper', 'diskmedel', 'tvättmedel',
            'sköljmedel', 'torktumlarbollar', 'torktumlardukar', 'torktumlarbollar',
            'torktumlardukar', 'torktumlarbollar', 'torktumlardukar', 'torktumlarbollar',
            'diskborste', 'binda', 'trosskydd', 'påskservetter'
        ],
        'Husdjur': [
            'hundmat', 'kattmat', 'fiskmat', 'fågelmat', 'hamstermat', 'kaninmat',
            'hundgodis', 'kattgodis', 'sand', 'strö', 'bur', 'koppel', 'halsband',
            'leksaker', 'bollar', 'tuggben', 'kost', 'foder', 'mat', 'godis', 'leksaker'
        ],
        'Bakning': [
            'bakpulver', 'jäst', 'vaniljsocker', 'kakao', 'choklad', 'mördeg', 'smördeg',
            'pajdeg', 'tårtbotten', 'tårtbotten', 'tårtbotten', 'tårtbotten', 'tårtbotten',
            'hamburgerbröd', 'brioche', 'rågkaka', 'vetekaka', 'hönökaka'
        ],
        'Frost': [
            'glass', 'frukt', 'grönsaker', 'kött', 'fisk', 'skaldjur', 'vegetariskt',
            'vegansk', 'glutenfritt', 'laktosfritt', 'mjölkfritt', 'äggfritt', 'fryst'
        ]
    };

    // Check each category's keywords
    for (const [category, keywords] of Object.entries(categories)) {
        for (const keyword of keywords) {
            if (name.includes(keyword) || desc.includes(keyword)) {
                return category;
            }
        }
    }

    // Default category if no match found
    return 'Övrigt';
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
            .neq('id', '00000000-0000-0000-0000-000000000000');
        
        if (deleteError) {
            console.error("Error clearing existing products:", deleteError);
            console.error("Error details:", JSON.stringify(deleteError));
        } else {
            console.log("Successfully cleared existing products");
        }
        
        // Prepare the data for products table format
        const validProducts = products.filter(product => {
            if (!product.name) {
                console.warn("Product missing name:", product);
                return false;
            }
            return true;
        }).map((product, index) => {
            // Extract price using the extractPrice function
            const { price, format } = extractPrice(product.price);
            console.log(`Product: ${product.name}, Raw price text: ${product.price}, Extracted price: ${price}, Format: ${format}`);
            
            // Create the product object with the original category
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
                position: index + 1,
                category: product.category
            };
        });
        
        if (validProducts.length !== products.length) {
            console.log(`Filtered out ${products.length - validProducts.length} invalid products`);
        }
        
        await storeProducts(validProducts);
        
    } catch (error) {
        console.error('Error during scraping:', error);
        throw error;
    } finally {
        await browser.close();
    }
}

async function storeProducts(products) {
    try {
        console.log(`Storing ${products.length} valid products in Supabase products table`);
        const firstProduct = products[0];
        console.log('First product example:', JSON.stringify(firstProduct));

        // Insert products with their original categories
        console.log('Inserting products with original categories...');
        const { data: insertedProducts, error: insertError } = await supabase
            .from('products')
            .insert(products)
            .select();

        if (insertError) {
            console.error('Error inserting products:', insertError);
            return;
        }

        console.log(`Successfully inserted ${insertedProducts.length} products`);
    } catch (error) {
        console.error('Error in storeProducts:', error);
        throw error;
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