
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
    console.log(`Preparing to store ${products.length} products in Willys table`);
    
    // Validate products before storing
    const validProducts = products.filter(product => {
      if (!product.name) {
        console.log("Skipping product without name:", product);
        return false;
      }
      
      // Ensure we have a price (convert to number if string)
      if (product.price !== undefined && product.price !== null) {
        if (typeof product.price === 'string') {
          const parsedPrice = parseInt(product.price);
          if (!isNaN(parsedPrice)) {
            product.price = parsedPrice;
          } else {
            console.log(`Invalid price for product ${product.name}:`, product.price);
            // Set a default price if parsing fails
            product.price = 0;
          }
        }
      } else {
        console.log(`Missing price for product ${product.name}, setting default`);
        product.price = 0;
      }
      
      // Ensure image_url is a string
      if (!product.image_url) {
        product.image_url = 'https://assets.icanet.se/t_product_large_v1,f_auto/7300156501245.jpg'; // Default image
      }
      
      // Store flag to identify products from Willys
      product.store = 'Willys';
      
      return true;
    });
    
    console.log(`Found ${validProducts.length} valid products to store`);
    
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
    
    for (let i = 0; i < validProducts.length; i += batchSize) {
      const batch = validProducts.slice(i, Math.min(i + batchSize, validProducts.length));
      console.log(`Inserting batch ${i/batchSize + 1} of ${Math.ceil(validProducts.length/batchSize)}`);
      
      const { data, error } = await supabase
        .from('Willys')
        .insert(batch)
        .select();
      
      if (error) {
        console.error(`Error inserting batch ${i/batchSize + 1}:`, error);
        console.error("First product in batch:", batch[0]);
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
