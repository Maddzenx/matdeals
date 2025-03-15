
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
    
    // Insert products in batches to avoid hitting statement size limits
    const batchSize = 10;
    let insertedCount = 0;
    
    for (let i = 0; i < products.length; i += batchSize) {
      const batch = products.slice(i, Math.min(i + batchSize, products.length));
      console.log(`Inserting batch ${i/batchSize + 1} of ${Math.ceil(products.length/batchSize)}`);
      
      const { data, error } = await supabase
        .from('Willys')
        .insert(batch)
        .select();
      
      if (error) {
        console.error(`Error inserting batch ${i/batchSize + 1}:`, error);
      } else {
        console.log(`Successfully inserted batch ${i/batchSize + 1} with ${data.length} products`);
        insertedCount += data.length;
      }
    }
    
    console.log(`Successfully stored ${insertedCount} products in Willys table`);
    return insertedCount;
  } catch (error) {
    console.error("Error in storeProducts:", error);
    throw error;
  }
}
