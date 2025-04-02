import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables from .env
dotenv.config();

// Initialize Supabase client
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// As a workaround, instead of modifying the column type, let's create a temporary solution
async function main() {
  try {
    console.log('Since we cannot alter the column type through the Supabase API, we will use a workaround...');
    
    // Step 1: Multiply decimal values by 100 to convert to integer cents/öre
    // This is a temporary solution until you can modify the schema in the Supabase dashboard
    
    console.log('First, triggering the scraper to get product data...');
    
    // Invoke the scrape-willys function
    const { data: scraperResponse, error: scraperError } = await supabase.functions.invoke('scrape-willys', {
      body: { 
        forceRefresh: true, 
        source: "manual-trigger",
        target: "willys"
      }
    });
    
    if (scraperError) {
      console.error('Error invoking scraper:', scraperError);
      return;
    }
    
    console.log('Scraper response received with', scraperResponse.products?.length || 0, 'products');
    
    if (!scraperResponse.products || scraperResponse.products.length === 0) {
      console.error('No products returned from scraper');
      return;
    }
    
    console.log('Processing products from scraper...');
    
    // First, clear existing data
    const { error: deleteError } = await supabase
      .from('Willys Johanneberg')
      .delete()
      .gt('Position', 0);
      
    if (deleteError) {
      console.error('Error clearing existing products:', deleteError);
    } else {
      console.log('Successfully cleared existing products');
    }
    
    // Process products to convert decimal prices to integers (cents/öre)
    const processedProducts = scraperResponse.products.map((product, index) => {
      // Parse prices
      const priceText = typeof product.price === 'string' ? product.price : String(product.price || 0);
      const originalPriceText = typeof product.original_price === 'string' ? product.original_price : String(product.original_price || 0);
      
      const priceClean = priceText.replace(',', '.').replace('kr', '').trim();
      const originalPriceClean = originalPriceText.replace(',', '.').replace('kr', '').trim();
      
      // Parse as float first
      const priceFloat = parseFloat(priceClean) || 0;
      const originalPriceFloat = parseFloat(originalPriceClean) || 0;
      
      // Convert to integer (cents/öre) by multiplying by 100
      const priceInt = Math.round(priceFloat * 100);
      const originalPriceInt = Math.round(originalPriceFloat * 100);
      
      // Calculate savings in öre/cents (integers)
      const savingsInt = originalPriceInt > priceInt ? originalPriceInt - priceInt : null;
      
      console.log(`Converting ${priceFloat} kr to ${priceInt} öre`);
      
      return {
        "Product Name": product.name || product['Product Name'] || 'Unknown Product',
        "Brand and Weight": product.description || product['Brand and Weight'] || null,
        "Price": priceInt, // Store as integer (öre/cents)
        "Product Image": product.image_url || product['Product Image'] || null,
        "Product Link": null,
        "Label 1": product.offer_details || "Veckans erbjudande",
        "Label 2": null,
        "Label 3": null,
        "Savings": savingsInt, // Store as integer (öre/cents)
        "Unit Price": product.comparison_price || null,
        "Purchase Limit": null,
        "Position": index + 1
      };
    });
    
    console.log(`Processed ${processedProducts.length} products`);
    console.log('Sample processed product:', processedProducts[0]);
    
    // Insert products
    const { data, error } = await supabase
      .from('Willys Johanneberg')
      .insert(processedProducts)
      .select();
      
    if (error) {
      console.error('Error inserting products:', error);
      
      // Try batch insertion
      console.log('Trying batch insertion...');
      let insertedCount = 0;
      const batchSize = 10;
      
      for (let i = 0; i < processedProducts.length; i += batchSize) {
        const batch = processedProducts.slice(i, i + batchSize);
        console.log(`Inserting batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(processedProducts.length / batchSize)}`);
        
        const { data: batchData, error: batchError } = await supabase
          .from('Willys Johanneberg')
          .insert(batch);
          
        if (batchError) {
          console.error(`Error with batch ${Math.floor(i / batchSize) + 1}:`, batchError);
        } else {
          insertedCount += batch.length;
          console.log(`Successfully inserted batch ${Math.floor(i / batchSize) + 1}`);
        }
      }
      
      console.log(`Inserted ${insertedCount} products in batches`);
    } else {
      console.log(`Successfully inserted ${data.length} products`);
    }
    
    // Verify products were inserted
    const { data: checkData, error: checkError } = await supabase
      .from('Willys Johanneberg')
      .select('*');
      
    if (checkError) {
      console.error('Error checking products:', checkError);
    } else {
      console.log(`Found ${checkData.length} products in database after insertion`);
    }
    
    console.log('\nIMPORTANT: Please note that we had to store prices as öre/cents (integers) because the column type is bigint.');
    console.log('To display prices in kr/SEK, divide the stored value by 100 in your frontend code.');
    console.log('For example, if the Price value is 2490, display it as 24.90 kr');
    console.log('\nIn the future, please update your table schema in the Supabase dashboard with these SQL commands:');
    console.log(`
-- Alter Price column to use DECIMAL type
ALTER TABLE "Willys Johanneberg" ALTER COLUMN "Price" TYPE DECIMAL(10,2);

-- Alter Savings column to use DECIMAL type
ALTER TABLE "Willys Johanneberg" ALTER COLUMN "Savings" TYPE DECIMAL(10,2);
    `);
  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

main(); 