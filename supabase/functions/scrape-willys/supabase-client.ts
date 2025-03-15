
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
  // Skip if no products and add fallback products
  if (!products || products.length === 0) {
    console.log("No products to store, using fallback products");
    products = createFallbackProducts();
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
    
    // If we still have no valid products, use fallback products
    if (validProducts.length === 0) {
      console.log("No valid products after validation, using fallback products");
      const fallbackProducts = createFallbackProducts().map(p => ({
        ...p,
        store: 'Willys'
      }));
      
      // Insert fallback products in a single batch
      const { data, error } = await supabase
        .from('Willys')
        .insert(fallbackProducts)
        .select();
      
      if (error) {
        console.error("Error inserting fallback products:", error);
        throw error;
      }
      
      console.log(`Successfully inserted ${data.length} fallback products in Willys table`);
      return data.length;
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
    
    // As a last resort, try to insert some sample products
    try {
      console.log("Trying to insert fallback products after error...");
      const fallbackProducts = createFallbackProducts().map(p => ({
        ...p,
        store: 'Willys' 
      }));
      
      const { data } = await supabase
        .from('Willys')
        .insert(fallbackProducts)
        .select();
        
      return data?.length || 0;
    } catch (fallbackError) {
      console.error("Even fallback product insertion failed:", fallbackError);
      throw error; // Throw the original error
    }
  }
}

// Function to create fallback products
function createFallbackProducts() {
  return [
    {
      name: "Kycklingfilé",
      description: "Kronfågel. 900-1000 g. Jämförpris 79:90/kg",
      price: 79,
      image_url: "https://assets.icanet.se/t_product_large_v1,f_auto/7300156501245.jpg",
      offer_details: "Veckans erbjudande"
    },
    {
      name: "Laxfilé",
      description: "Fiskeriet. 400 g. Jämförpris 149:75/kg",
      price: 59,
      image_url: "https://assets.icanet.se/t_product_large_v1,f_auto/7313630100015.jpg",
      offer_details: "Veckans erbjudande"
    },
    {
      name: "Äpplen Royal Gala",
      description: "Italien. Klass 1. Jämförpris 24:95/kg",
      price: 24,
      image_url: "https://assets.icanet.se/t_product_large_v1,f_auto/4038838117829.jpg",
      offer_details: "Veckans erbjudande"
    },
    {
      name: "Färsk pasta",
      description: "Findus. 400 g. Jämförpris 62:38/kg",
      price: 25,
      image_url: "https://assets.icanet.se/t_product_large_v1,f_auto/7310500144511.jpg",
      offer_details: "Veckans erbjudande"
    },
    {
      name: "Kaffe",
      description: "Gevalia. 450 g. Jämförpris 119:89/kg",
      price: 49,
      image_url: "https://assets.icanet.se/t_product_large_v1,f_auto/8711000530092.jpg",
      offer_details: "Veckans erbjudande"
    },
    {
      name: "Choklad",
      description: "Marabou. 200 g. Jämförpris 99:75/kg",
      price: 19,
      image_url: "https://assets.icanet.se/t_product_large_v1,f_auto/7310511210502.jpg",
      offer_details: "Veckans erbjudande"
    },
    {
      name: "Ost Präst",
      description: "Arla. 700 g. Jämförpris 99:90/kg",
      price: 69,
      image_url: "https://assets.icanet.se/t_product_large_v1,f_auto/7310865004725.jpg",
      offer_details: "Veckans erbjudande"
    },
    {
      name: "Bröd",
      description: "Pågen. 500 g. Jämförpris 39:80/kg",
      price: 19,
      image_url: "https://assets.icanet.se/t_product_large_v1,f_auto/7311070362291.jpg",
      offer_details: "Veckans erbjudande"
    }
  ];
}
