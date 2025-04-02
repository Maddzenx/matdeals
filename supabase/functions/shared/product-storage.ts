// @deno-types="https://deno.land/x/supabase@1.3.1/mod.d.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

// Initialize the Supabase client
const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";

// Ensure we validate that proper environment variables are set
if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase URL or Service Role Key");
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Define the Product interface for our unified table
export interface Product {
  product_name: string;
  description?: string | null;
  price: number | null;
  original_price?: number | null;
  image_url?: string | null;
  product_url?: string | null;
  offer_details?: string | null;
  label?: string | null;
  savings?: number | null;
  unit_price?: string | null;
  purchase_limit?: string | null;
  store: string;
  store_location?: string | null;
  position: number;
}

/**
 * Stores a list of products in the Supabase database
 * @param supabaseUrl Supabase project URL
 * @param supabaseKey Supabase service role key
 * @param products Array of products to store
 * @param storeName The name of the store (e.g., 'willys')
 * @param storeLocation Optional store location (e.g., 'johanneberg')
 * @param clearExisting Whether to clear existing products for this store
 * @returns The number of products stored
 */
export async function storeProducts(
  supabaseUrl: string,
  supabaseKey: string,
  products: Product[],
  storeName: string,
  storeLocation?: string,
  clearExisting = true
): Promise<number> {
  // Initialize Supabase client
  const supabase = createClient(supabaseUrl, supabaseKey);
  
  console.log(`Storing ${products.length} products for ${storeName}${storeLocation ? ` (${storeLocation})` : ''}`);
  
  try {
    // Add store and store_location to each product if not set
    const enrichedProducts = products.map(product => ({
      ...product,
      store: product.store || storeName,
      store_location: product.store_location || storeLocation || null
    }));
    
    // First clear existing products for this store if requested
    if (clearExisting) {
      const clearFilter: any = { store: storeName };
      if (storeLocation) {
        clearFilter.store_location = storeLocation;
      }
      
      const { error: clearError } = await supabase
        .from('products')
        .delete()
        .match(clearFilter);
        
      if (clearError) {
        console.error(`Error clearing existing products for ${storeName}:`, clearError);
        throw new Error(`Failed to clear existing products: ${clearError.message}`);
      }
      
      console.log(`Cleared existing products for ${storeName}${storeLocation ? ` (${storeLocation})` : ''}`);
    }
    
    // Validate products (ensure required fields are present)
    const validProducts = enrichedProducts.filter(product => product.product_name);
    if (validProducts.length !== enrichedProducts.length) {
      console.warn(`Filtered out ${enrichedProducts.length - validProducts.length} invalid products (missing product_name)`);
    }
    
    if (validProducts.length === 0) {
      console.warn("No valid products to insert");
      return 0;
    }
    
    // If we have many products, insert them in batches to avoid request size limits
    const BATCH_SIZE = 50;
    let insertedCount = 0;
    
    // Insert in batches if there are many products
    if (validProducts.length > BATCH_SIZE) {
      console.log(`Inserting ${validProducts.length} products in batches of ${BATCH_SIZE}`);
      
      for (let i = 0; i < validProducts.length; i += BATCH_SIZE) {
        const batch = validProducts.slice(i, i + BATCH_SIZE);
        const { error: batchError } = await supabase
          .from('products')
          .insert(batch);
          
        if (batchError) {
          console.error(`Error inserting batch ${Math.floor(i / BATCH_SIZE) + 1}:`, batchError);
        } else {
          insertedCount += batch.length;
          console.log(`Successfully inserted batch ${Math.floor(i / BATCH_SIZE) + 1} (${batch.length} products)`);
        }
      }
      
      console.log(`Inserted ${insertedCount} out of ${validProducts.length} products in batches`);
    } else {
      // Insert all products at once
      const { error: insertError } = await supabase
        .from('products')
        .insert(validProducts);
        
      if (insertError) {
        console.error('Error inserting products:', insertError);
        throw new Error(`Failed to insert products: ${insertError.message}`);
      }
      
      insertedCount = validProducts.length;
      console.log(`Successfully inserted ${insertedCount} products`);
    }
    
    return insertedCount;
  } catch (error) {
    console.error('Error in storeProducts:', error);
    throw error;
  }
}

/**
 * Store product data in the Willys Johanneberg table
 */
async function storeWillysProducts(products: Product[]): Promise<number> {
  console.log(`Preparing to store ${products.length} products in Supabase (Willys Johanneberg table)`);
  console.log(`Supabase URL: ${supabaseUrl}`);
  console.log(`Service Key available: ${supabaseKey ? "Yes" : "No"}`);
  
  try {
    // First, clear existing products to avoid duplication
    console.log("Clearing existing products from Willys Johanneberg table");
    
    const { error: deleteError } = await supabase
      .from('Willys Johanneberg')
      .delete()
      .gt('Position', 0); // Assuming Position > 0 for all regular products
    
    if (deleteError) {
      console.error("Error clearing existing products:", deleteError);
      console.error("Error details:", JSON.stringify(deleteError));
      // Continue anyway to insert new products
    } else {
      console.log("Successfully cleared existing products");
    }
    
    // First check if we can get any data from the table
    console.log("Checking if we can read from the Willys Johanneberg table");
    const { data: existingData, error: readError } = await supabase
      .from('Willys Johanneberg')
      .select('*')
      .limit(1);
      
    if (readError) {
      console.error("Error reading from Willys Johanneberg table:", readError);
      console.error("Error details:", JSON.stringify(readError));
    } else {
      console.log("Successfully read from table, found rows:", existingData?.length || 0);
    }
    
    // Prepare the data for Willys Johanneberg table format
    const validProducts = products.filter(product => {
      // Basic validation
      if (!product.product_name) {
        console.warn("Product missing product_name:", product);
        return false;
      }
      
      return true;
    }).map((product, index) => {
      // Convert decimal prices to integers (multiply by 100)
      const priceCents = product.price ? Math.round(product.price * 100) : 0;
      const savingsCents = product.original_price && product.price 
        ? Math.round((product.original_price - product.price) * 100)
        : 0;
      
      // Map to Willys Johanneberg table schema
      return {
        "Product Name": product.product_name,
        "Brand and Weight": product.description || null,
        "Price": priceCents, // Store price as cents/öre
        "Product Image": product.image_url || null,
        "Product Link": null,
        "Label 1": product.offer_details || "Veckans erbjudande",
        "Label 2": null,
        "Label 3": null,
        "Savings": savingsCents, // Store savings as cents/öre
        "Unit Price": product.unit_price || null,
        "Purchase Limit": product.purchase_limit || null,
        "Position": index + 1
      };
    });
    
    if (validProducts.length !== products.length) {
      console.log(`Filtered out ${products.length - validProducts.length} invalid products`);
    }
    
    console.log(`Storing ${validProducts.length} valid products in Supabase Willys Johanneberg table`);
    console.log("First product example:", JSON.stringify(validProducts[0]));
    
    // Try inserting a single product first to test
    console.log("Testing insertion with first product");
    const { data: testData, error: testError } = await supabase
      .from('Willys Johanneberg')
      .insert([validProducts[0]])
      .select();
      
    if (testError) {
      console.error("Error inserting test product:", testError);
      console.error("Error details:", JSON.stringify(testError));
      console.error("This suggests there's a structural issue with the table or data");
      return 0;
    } else {
      console.log("Successfully inserted test product:", testData);
    }
    
    // Insert in batches to avoid exceeding request sizes
    const batchSize = 20;
    let insertedCount = 0;
    
    for (let i = 1; i < validProducts.length; i += batchSize) { // Start from 1 since we already inserted first product
      const batch = validProducts.slice(i, i + batchSize);
      console.log(`Inserting batch ${Math.floor(i / batchSize) + 1} with ${batch.length} products`);
      
      const { data, error } = await supabase
        .from('Willys Johanneberg')
        .insert(batch)
        .select('Position');
      
      if (error) {
        console.error(`Error inserting batch ${Math.floor(i / batchSize) + 1}:`, error);
        console.error("Error details:", JSON.stringify(error));
        
        // Try inserting one by one to identify problematic records
        for (const product of batch) {
          const { error: singleError } = await supabase
            .from('Willys Johanneberg')
            .insert(product);
          
          if (!singleError) {
            insertedCount++;
          } else {
            console.error(`Error inserting product '${product["Product Name"]}':`, singleError);
            console.error("Problematic product:", product);
          }
        }
      } else {
        console.log(`Successfully inserted batch ${Math.floor(i / batchSize) + 1} with ${batch.length} products`);
        insertedCount += batch.length;
      }
    }
    
    // Add the test product to the count
    insertedCount += 1;
    
    console.log(`Successfully stored ${insertedCount} out of ${validProducts.length} products`);
    return insertedCount;
  } catch (error) {
    console.error("Error storing products:", error);
    console.error("Error details:", JSON.stringify(error));
    return 0;
  }
} 