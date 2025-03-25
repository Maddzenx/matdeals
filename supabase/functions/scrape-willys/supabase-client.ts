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
  
  console.log(`Preparing to store ${products.length} products in Supabase (Willys Johanneberg table)`);
  
  try {
    // First, clear existing products to avoid duplication
    console.log("Clearing existing products from Willys Johanneberg table");
    
    // Clear existing products but keep system rows if any
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
    
    // Prepare the data for Willys Johanneberg table format
    const validProducts = products.filter(product => {
      // Basic validation
      if (!product["Product Name"] && !product.name) {
        console.warn("Product missing name:", product);
        return false;
      }
      
      return true;
    }).map((product, index) => {
      // Map to Willys Johanneberg table schema
      return {
        "Product Name": product["Product Name"] || product.name,
        "Brand and Weight": product["Brand and Weight"] || product.description || null,
        "Price": typeof product.price === 'number' ? product.price : 
                (typeof product.Price === 'number' ? product.Price : 
                (parseInt(String(product.price || product.Price)) || 0)),
        "Product Image": product["Product Image"] || product.image_url || null,
        "Product Link": product["Product Link"] || null,
        "Label 1": product["Label 1"] || "Veckans erbjudande",
        "Label 2": product["Label 2"] || null,
        "Label 3": product["Label 3"] || null,
        "Savings": product["Savings"] || null,
        "Unit Price": product["Unit Price"] || null,
        "Purchase Limit": product["Purchase Limit"] || null,
        "Position": product["Position"] || (index + 1)
      };
    });
    
    if (validProducts.length !== products.length) {
      console.log(`Filtered out ${products.length - validProducts.length} invalid products`);
    }
    
    console.log(`Storing ${validProducts.length} valid products in Supabase Willys Johanneberg table`);
    console.log("First product example:", JSON.stringify(validProducts[0]));
    
    // Insert in batches to avoid exceeding request sizes
    const batchSize = 20;
    let insertedCount = 0;
    
    for (let i = 0; i < validProducts.length; i += batchSize) {
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
    
    console.log(`Successfully stored ${insertedCount} out of ${validProducts.length} products`);
    return insertedCount;
  } catch (error) {
    console.error("Error storing products:", error);
    console.error("Error details:", JSON.stringify(error));
    return 0;
  }
}
