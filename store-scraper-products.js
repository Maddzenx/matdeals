import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables from .env
dotenv.config();

// Initialize Supabase client
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY; // Need service role key for upserts

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
  try {
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
    
    // Process products to the correct format
    const processedProducts = scraperResponse.products.map((product, index) => {
      // Parse prices as kr/SEK (decimal) instead of öre/cents (integer)
      const priceText = typeof product.price === 'string' ? product.price : String(product.price || 0);
      const originalPriceText = typeof product.original_price === 'string' ? product.original_price : String(product.original_price || 0);
      
      const priceClean = priceText.replace(',', '.').replace('kr', '').trim();
      const originalPriceClean = originalPriceText.replace(',', '.').replace('kr', '').trim();
      
      const priceVal = parseFloat(priceClean) || 0;
      const originalPriceVal = parseFloat(originalPriceClean) || 0;
      
      // Store as decimal (kr/SEK) rather than integers (öre/cents)
      const savings = originalPriceVal > priceVal ? originalPriceVal - priceVal : null;
      
      return {
        "Product Name": product.name || product['Product Name'] || 'Unknown Product',
        "Brand and Weight": product.description || product['Brand and Weight'] || null,
        "Price": priceVal,
        "Product Image": product.image_url || product['Product Image'] || null,
        "Product Link": null,
        "Label 1": product.offer_details || "Veckans erbjudande",
        "Label 2": null,
        "Label 3": null,
        "Savings": savings,
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
  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

main(); 