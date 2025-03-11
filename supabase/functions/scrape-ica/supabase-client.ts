
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
  const supabase = createSupabaseClient();
  
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
    
    // Join all parts with a separator
    const fullDescription = descriptionParts.filter(Boolean).join(' | ');
    
    return {
      name: product.name,
      description: fullDescription || null,
      price: product.price,
      image_url: product.image_url
    };
  });

  // Insert all new products
  const { error: insertError } = await supabase
    .from('ICA')
    .insert(dbProducts);
  
  if (insertError) {
    console.error("Error inserting new products:", insertError);
    throw insertError;
  }
  
  console.log(`Successfully inserted ${products.length} new offers`);
  return products.length;
}
