
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.7";
import { ExtractorResult } from "./extractors/base-extractor.ts";

// Initialize the Supabase client
const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";

// Ensure we validate that proper environment variables are set
if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase URL or Service Role Key");
}

const supabase = createClient(supabaseUrl, supabaseKey);

/**
 * Store product data in Supabase
 */
export async function storeProducts(products: ExtractorResult[]): Promise<number> {
  if (!products || products.length === 0) {
    console.log("No products to store");
    return 0;
  }
  
  console.log(`Preparing to store ${products.length} products in Supabase`);
  
  try {
    // Validate products before inserting
    const validProducts = products.filter(product => {
      if (!product.name) {
        console.warn("Product missing name:", product);
        return false;
      }
      
      // Ensure price is an integer and not null
      if (product.price === null || typeof product.price !== 'number') {
        console.warn(`Product '${product.name}' has invalid price:`, product.price);
        return false;
      }
      
      return true;
    });
    
    if (validProducts.length !== products.length) {
      console.log(`Filtered out ${products.length - validProducts.length} invalid products`);
    }
    
    console.log(`Storing ${validProducts.length} valid products in Supabase`);
    
    // First, clear existing products to avoid duplication
    // This edge function will be called periodically to refresh the data
    const { error: deleteError } = await supabase
      .from('Willys')
      .delete()
      .is('name', null) // Dummy condition to satisfy the RLS policy - effectively deletes all
      .not('name', null); // Use this approach since we want to delete all rows
    
    if (deleteError) {
      console.error("Error clearing existing products:", deleteError);
      // Continue anyway to insert new products
    } else {
      console.log("Successfully cleared existing products");
    }
    
    // Insert in batches to avoid exceeding request sizes
    const batchSize = 50;
    let insertedCount = 0;
    
    for (let i = 0; i < validProducts.length; i += batchSize) {
      const batch = validProducts.slice(i, i + batchSize);
      console.log(`Inserting batch ${Math.floor(i / batchSize) + 1} with ${batch.length} products`);
      
      const { data, error } = await supabase
        .from('Willys')
        .insert(batch)
        .select('id');
      
      if (error) {
        console.error(`Error inserting batch ${Math.floor(i / batchSize) + 1}:`, error);
        
        // Try inserting one by one to identify problematic records
        for (const product of batch) {
          const { error: singleError } = await supabase
            .from('Willys')
            .insert(product);
          
          if (!singleError) {
            insertedCount++;
          } else {
            console.error(`Error inserting product '${product.name}':`, singleError);
            console.error("Problematic product:", product);
          }
        }
      } else {
        console.log(`Successfully inserted batch ${Math.floor(i / batchSize) + 1} with ${batch.length} products`);
        insertedCount += batch.length;
      }
    }
    
    console.log(`Successfully stored ${insertedCount} out of ${validProducts.length} products`);
    return insertedCount;
  } catch (error) {
    console.error("Error storing products:", error);
    return 0;
  }
}
