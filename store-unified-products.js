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

/**
 * Converts prices from öre/cents (integers) to kr/SEK (decimals)
 */
function convertPricesFromOreToKr(willysJohannebergProducts) {
  return willysJohannebergProducts.map(product => {
    // Convert Price from öre to kr
    let priceInKr = null;
    if (typeof product.Price === 'number') {
      priceInKr = product.Price / 100;
    }
    
    // Convert Savings from öre to kr
    let savingsInKr = null;
    if (product.Savings && typeof product.Savings === 'number') {
      savingsInKr = product.Savings / 100;
    }
    
    return {
      product_name: product['Product Name'],
      description: product['Brand and Weight'],
      price: priceInKr,
      image_url: product['Product Image'],
      product_url: product['Product Link'],
      offer_details: product['Label 1'],
      label: product['Label 2'] || product['Label 3'],
      savings: savingsInKr,
      unit_price: product['Unit Price'],
      purchase_limit: product['Purchase Limit'],
      store: 'willys',
      store_location: 'johanneberg',
      position: product.Position
    };
  });
}

/**
 * Stores products in the unified products table
 */
async function storeInUnifiedTable(products, store, storeLocation) {
  console.log(`Preparing to store ${products.length} products for ${store} (${storeLocation})`);
  
  // First clear existing products for this store/location
  const { error: deleteError } = await supabase
    .from('products')
    .delete()
    .match({ store, store_location: storeLocation });
    
  if (deleteError) {
    console.error('Error clearing existing products:', deleteError);
    return 0;
  }
  
  console.log('Successfully cleared existing products');
  
  // Insert products
  const { data, error } = await supabase
    .from('products')
    .insert(products)
    .select();
    
  if (error) {
    console.error('Error inserting products:', error);
    
    // Try batch insertion
    console.log('Trying batch insertion...');
    let insertedCount = 0;
    const batchSize = 10;
    
    for (let i = 0; i < products.length; i += batchSize) {
      const batch = products.slice(i, i + batchSize);
      console.log(`Inserting batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(products.length / batchSize)}`);
      
      const { data: batchData, error: batchError } = await supabase
        .from('products')
        .insert(batch);
        
      if (batchError) {
        console.error(`Error with batch ${Math.floor(i / batchSize) + 1}:`, batchError);
      } else {
        insertedCount += batch.length;
        console.log(`Successfully inserted batch ${Math.floor(i / batchSize) + 1}`);
      }
    }
    
    console.log(`Inserted ${insertedCount} products in batches`);
    return insertedCount;
  }
  
  console.log(`Successfully inserted ${data.length} products`);
  return data.length;
}

/**
 * Create the products table
 */
async function createProductsTable() {
  console.log('Creating products table...');
  
  // SQL to create the products table
  const sql = `
  -- Create a unified products table for all stores
  CREATE TABLE IF NOT EXISTS "products" (
      "id" SERIAL PRIMARY KEY,
      "product_name" TEXT NOT NULL,
      "description" TEXT,
      "price" DECIMAL(10,2),
      "original_price" DECIMAL(10,2),
      "image_url" TEXT,
      "product_url" TEXT,
      "offer_details" TEXT,
      "label" TEXT,
      "savings" DECIMAL(10,2),
      "unit_price" TEXT,
      "purchase_limit" TEXT,
      "store" TEXT NOT NULL,
      "store_location" TEXT,
      "position" INTEGER,
      "created_at" TIMESTAMP WITH TIME ZONE DEFAULT now(),
      "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT now()
  );
  
  -- Add index for faster queries
  CREATE INDEX IF NOT EXISTS idx_products_store ON "products" (store);
  
  -- Enable Row Level Security (RLS)
  ALTER TABLE "products" ENABLE ROW LEVEL SECURITY;
  
  -- Create a policy to allow public read access
  CREATE POLICY "Allow public read access on products"
      ON "products"
      FOR SELECT TO public
      USING (true);
  `;
  
  try {
    // Execute SQL directly
    const { error } = await supabase.rpc('exec_sql', { sql });
    
    if (error) {
      console.error('Error creating products table with RPC:', error);
      console.log('You will need to create the table manually in the Supabase dashboard.');
      console.log('SQL to run:');
      console.log(sql);
      return false;
    }
    
    console.log('Products table created successfully!');
    return true;
  } catch (error) {
    console.error('Error creating products table:', error);
    console.log('You will need to create the table manually in the Supabase dashboard.');
    console.log('SQL to run:');
    console.log(sql);
    return false;
  }
}

/**
 * Check if the products table exists
 */
async function checkTableExists(tableName) {
  try {
    // A simple test query to see if the table exists
    const { data, error } = await supabase
      .from(tableName)
      .select('id')
      .limit(1);
    
    if (error) {
      if (error.code === '42P01') { // relation does not exist
        console.log(`Table ${tableName} does not exist`);
        return false;
      } else {
        console.error(`Error checking if table ${tableName} exists:`, error);
        throw error;
      }
    }
    
    console.log(`Table ${tableName} exists`);
    return true;
  } catch (error) {
    console.error(`Error checking if table ${tableName} exists:`, error);
    return false;
  }
}

/**
 * Main function to create the products table and migrate data
 */
async function main() {
  console.log('Starting product migration to unified table...');
  
  // Check if products table exists
  const tableExists = await checkTableExists('products');
  
  if (!tableExists) {
    console.log('Products table does not exist. Attempting to create it...');
    const tableCreated = await createProductsTable();
    
    if (!tableCreated) {
      console.log('Failed to create products table. Please create it manually and run this script again.');
      process.exit(1);
    }
  }
  
  // Get products from Willys Johanneberg table
  console.log('Fetching products from Willys Johanneberg table...');
  const { data: willysJohannebergData, error: willysJohannebergError } = await supabase
    .from('Willys Johanneberg')
    .select('*');
    
  if (willysJohannebergError) {
    console.error('Error fetching products from Willys Johanneberg table:', willysJohannebergError);
  } else if (willysJohannebergData && willysJohannebergData.length > 0) {
    console.log(`Found ${willysJohannebergData.length} products in Willys Johanneberg table`);
    
    // Convert prices from öre to kr
    const unifiedProducts = convertPricesFromOreToKr(willysJohannebergData);
    
    // Store in unified table
    const insertedCount = await storeInUnifiedTable(unifiedProducts, 'willys', 'johanneberg');
    console.log(`Successfully migrated ${insertedCount} products from Willys Johanneberg to unified table`);
  } else {
    console.log('No products found in Willys Johanneberg table');
    
    // Optionally trigger the scraper to get fresh data
    console.log('Triggering scraper to get fresh data...');
    const { data: scraperResponse, error: scraperError } = await supabase.functions.invoke('scrape-willys', {
      body: { 
        forceRefresh: true, 
        source: "migration-script",
        target: "willys"
      }
    });
    
    if (scraperError) {
      console.error('Error invoking scraper:', scraperError);
    } else {
      console.log(`Scraper successfully invoked and stored ${scraperResponse.products?.length || 0} products`);
    }
  }
  
  // Verify products in unified table
  const { data: unifiedData, error: unifiedError } = await supabase
    .from('products')
    .select('*')
    .eq('store', 'willys')
    .eq('store_location', 'johanneberg');
    
  if (unifiedError) {
    console.error('Error checking products in unified table:', unifiedError);
  } else {
    console.log(`Found ${unifiedData?.length || 0} products in unified table for Willys Johanneberg`);
    
    if (unifiedData && unifiedData.length > 0) {
      console.log('\nSample product from unified table:');
      console.log(unifiedData[0]);
    }
  }
  
  console.log('\nMigration completed!');
  console.log('You can now use the unified products table for all your stores.');
}

main(); 