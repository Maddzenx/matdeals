
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.1';

const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY') || '';
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';

const supabase = createClient(
  supabaseUrl,
  supabaseServiceKey || supabaseAnonKey
);

/**
 * Stores products in the Supabase database
 */
export async function storeProducts(products: any[]): Promise<number> {
  // Skip if no products
  if (!products || products.length === 0) {
    console.log("No products to store");
    return 0;
  }

  try {
    console.log(`Storing ${products.length} products in Willys table`);
    
    // First, clear existing records
    const { error: deleteError } = await supabase
      .from('Willys')
      .delete()
      .not('id', 'is', null);
      
    if (deleteError) {
      console.error("Error clearing existing Willys products:", deleteError);
      // Continue anyway to try inserting new products
    } else {
      console.log("Successfully cleared existing Willys products");
    }
    
    // Transform products for database storage
    const transformedProducts = products.map(product => {
      return {
        name: product.name,
        description: product.description,
        price: product.price,
        image_url: product.image_url,
        original_price: product.original_price,
        comparison_price: product.comparison_price,
        offer_details: product.offer_details,
        quantity_info: product.quantity_info
      };
    });
    
    // Insert products
    const { data, error } = await supabase
      .from('Willys')
      .insert(transformedProducts)
      .select();
    
    if (error) {
      console.error("Error inserting products:", error);
      throw error;
    }
    
    console.log(`Successfully stored ${data.length} products in Willys table`);
    return data.length;
  } catch (error) {
    console.error("Error in storeProducts:", error);
    throw error;
  }
}
