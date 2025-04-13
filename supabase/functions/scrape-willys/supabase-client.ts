import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.7";
import { ExtractorResult } from "./types.ts";

// Initialize the Supabase client
const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";

// Ensure we validate that proper environment variables are set
if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase URL or Service Role Key");
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Define structure for legacy table format
interface WillysJohannebergProduct {
  "Product Name": string;
  "Brand and Weight": string | null;
  "Price": number;
  "Product Image": string | null;
  "Product Link": string | null;
  "Label 1": string | null;
  "Label 2": string | null;
  "Label 3": string | null;
  "Savings": number | null;
  "Unit Price": string | null;
  "Purchase Limit": string | null;
  "Position": number;
}

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
    const validProducts: WillysJohannebergProduct[] = products.filter(product => {
      // Basic validation
      if (!product.name) {
        console.warn("Product missing name:", product);
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
        "Product Name": product.name,
        "Brand and Weight": product.description || null,
        "Price": priceCents, // Store price as cents/öre
        "Product Image": product.image_url || null,
        "Product Link": null,
        "Label 1": product.offer_details || "Veckans erbjudande",
        "Label 2": null,
        "Label 3": null,
        "Savings": savingsCents, // Store savings as cents/öre
        "Unit Price": product.comparison_price || null,
        "Purchase Limit": product.quantity_info || null,
        "Position": index + 1
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
