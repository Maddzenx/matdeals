
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Product } from "./types/product.ts";

/**
 * Creates and returns a Supabase client
 */
export function createSupabaseClient() {
  const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
  const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY") || "";
  
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error("Missing Supabase credentials");
  }
  
  return createClient(supabaseUrl, supabaseAnonKey);
}

/**
 * Stores products in Supabase by clearing existing data and inserting new products
 */
export async function storeProducts(products: Product[]) {
  if (!products || products.length === 0) {
    console.log("No products to store");
    return 0;
  }
  
  const supabase = createSupabaseClient();
  
  try {
    // Clear all existing products first
    console.log("Clearing all existing ICA products...");
    const { error: deleteError } = await supabase
      .from('ICA')
      .delete()
      .neq('name', ''); // Delete all rows
    
    if (deleteError) {
      console.error("Error clearing existing products:", deleteError);
      throw deleteError;
    }
    
    console.log("Successfully cleared existing products. Inserting new products...");

    // Map products to the database schema
    const dbProducts = products.map(product => {
      // Build a comprehensive description that includes all product details
      const descriptionParts = [];
      
      // Add brand/description if available
      if (product.description) {
        descriptionParts.push(product.description);
      }
      
      // Add quantity info if available
      if (product.quantity_info) {
        descriptionParts.push(product.quantity_info);
      }
      
      // Add offer details if available 
      if (product.offer_details) {
        descriptionParts.push(product.offer_details);
      }
      
      // Add comparison price if available
      if (product.comparison_price) {
        descriptionParts.push(product.comparison_price);
      }
      
      // Add original price if available
      if (product.original_price) {
        descriptionParts.push(product.original_price);
      }
      
      // Add member price info if it's a member-only price
      if (product.is_member_price) {
        descriptionParts.push("Stämmispris");
      }
      
      // Join all parts with a separator
      const fullDescription = descriptionParts.filter(Boolean).join(' | ');
      
      // Check that product name is not null or undefined
      if (!product.name || product.name.toLowerCase().includes("lägg i inköpslista")) {
        return null; // Skip invalid products
      }
      
      return {
        name: product.name,
        description: fullDescription || null,
        price: product.price,
        image_url: product.image_url,
        is_member_price: product.is_member_price || false
      };
    }).filter(Boolean); // Remove null items

    // To avoid hitting query size limits, insert in batches of 20
    const batchSize = 20;
    const batches = [];
    
    for (let i = 0; i < dbProducts.length; i += batchSize) {
      batches.push(dbProducts.slice(i, i + batchSize));
    }
    
    let successCount = 0;
    
    for (const batch of batches) {
      const { error: insertError } = await supabase
        .from('ICA')
        .insert(batch);
      
      if (insertError) {
        console.error("Error inserting batch of products:", insertError);
        // Continue with other batches even if this one failed
      } else {
        successCount += batch.length;
      }
    }
    
    console.log(`Successfully inserted ${successCount} of ${dbProducts.length} products`);
    return successCount;
  } catch (error) {
    console.error("Error storing products in Supabase:", error);
    throw error;
  }
}
