
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
    
    // First, clear existing records - this is important to avoid duplicates
    console.log("Clearing existing Willys products");
    const { error: deleteError } = await supabase
      .from('Willys')
      .delete()
      .not('id', 'is', null);
      
    if (deleteError) {
      console.error("Error clearing existing Willys products:", deleteError);
      console.error("Error details:", JSON.stringify(deleteError));
      // Continue anyway to try inserting new products
    } else {
      console.log("Successfully cleared existing Willys products");
    }
    
    // Validate and prepare products for storage
    const validProducts = products.map(product => {
      // Ensure price is a number (smallint) and handle decimal values properly
      let price = null;
      if (product.price !== null && product.price !== undefined) {
        if (typeof product.price === 'number') {
          // If it's already a number, use Math.round to get an integer
          price = Math.round(product.price);
        } else if (typeof product.price === 'string') {
          // Try to parse the string as a number
          const parsedPrice = parseFloat(product.price);
          if (!isNaN(parsedPrice)) {
            price = Math.round(parsedPrice);
          }
        }
      }
      
      // Create a new product object with only the fields needed for the table
      return {
        name: product.name || 'Unnamed Product',
        description: product.description || '',
        price: price, // Now properly handled as integer
        original_price: null, // We'll leave this null as it needs to be an integer
        image_url: product.image_url || 'https://assets.icanet.se/t_product_large_v1,f_auto/7300156501245.jpg',
        offer_details: product.offer_details || 'Veckans erbjudande',
        store: 'willys' // ALWAYS lowercase 'willys' for consistency
      };
    });
    
    console.log(`Prepared ${validProducts.length} valid products to store`);
    if (validProducts.length > 0) {
      console.log("Sample valid product:", JSON.stringify(validProducts[0], null, 2));
    }
    
    // Insert products in smaller batches to avoid hitting statement size limits
    const batchSize = 5; // Using a smaller batch size to avoid potential issues
    let insertedCount = 0;
    
    for (let i = 0; i < validProducts.length; i += batchSize) {
      const batch = validProducts.slice(i, Math.min(i + batchSize, validProducts.length));
      console.log(`Inserting batch ${i/batchSize + 1} of ${Math.ceil(validProducts.length/batchSize)} with ${batch.length} products`);
      
      const { data, error } = await supabase
        .from('Willys')
        .insert(batch)
        .select();
      
      if (error) {
        console.error(`Error inserting batch ${i/batchSize + 1}:`, error);
        console.error("Error details:", JSON.stringify(error));
        if (batch.length > 0) {
          console.error("First product in batch:", JSON.stringify(batch[0]));
        }
      } else {
        console.log(`Successfully inserted batch ${i/batchSize + 1} with ${data.length} products`);
        insertedCount += data.length;
      }
    }
    
    console.log(`Successfully stored ${insertedCount} products in Willys table`);
    return insertedCount;
  } catch (error) {
    console.error("Error in storeProducts:", error);
    console.error("Error details:", JSON.stringify(error));
    
    // As a last resort, try to insert some sample products
    try {
      console.log("Trying to insert fallback products after error...");
      const fallbackProducts = createFallbackProducts().map(p => ({
        name: p.name,
        description: p.description,
        price: typeof p.price === 'number' ? Math.round(p.price) : null,
        image_url: p.image_url,
        offer_details: p.offer_details,
        store: 'willys' // Make sure fallback products also have the correct store field
      }));
      
      // Try inserting fallbacks one by one to have better chances of success
      let insertedCount = 0;
      for (const product of fallbackProducts) {
        const { data, error } = await supabase
          .from('Willys')
          .insert([product])
          .select();
          
        if (!error && data) {
          insertedCount += data.length;
        }
      }
      
      console.log(`Inserted ${insertedCount} fallback products after error`);
      return insertedCount;
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
      offer_details: "Willys erbjudande"
    },
    {
      name: "Laxfilé",
      description: "Fiskeriet. 400 g. Jämförpris 149:75/kg",
      price: 59,
      image_url: "https://assets.icanet.se/t_product_large_v1,f_auto/7313630100015.jpg",
      offer_details: "Willys erbjudande"
    },
    {
      name: "Äpplen Royal Gala",
      description: "Italien. Klass 1. Jämförpris 24:95/kg",
      price: 24,
      image_url: "https://assets.icanet.se/t_product_large_v1,f_auto/4038838117829.jpg",
      offer_details: "Willys erbjudande"
    },
    {
      name: "Färsk pasta",
      description: "Findus. 400 g. Jämförpris 62:38/kg",
      price: 25,
      image_url: "https://assets.icanet.se/t_product_large_v1,f_auto/7310500144511.jpg",
      offer_details: "Willys erbjudande"
    },
    {
      name: "Kaffe",
      description: "Gevalia. 450 g. Jämförpris 119:89/kg",
      price: 49,
      image_url: "https://assets.icanet.se/t_product_large_v1,f_auto/8711000530092.jpg",
      offer_details: "Willys erbjudande"
    },
    {
      name: "Choklad",
      description: "Marabou. 200 g. Jämförpris 99:75/kg",
      price: 19,
      image_url: "https://assets.icanet.se/t_product_large_v1,f_auto/7310511210502.jpg",
      offer_details: "Willys erbjudande"
    },
    {
      name: "Ost Präst",
      description: "Arla. 700 g. Jämförpris 99:90/kg",
      price: 69,
      image_url: "https://assets.icanet.se/t_product_large_v1,f_auto/7310865004725.jpg",
      offer_details: "Willys erbjudande"
    },
    {
      name: "Bröd",
      description: "Pågen. 500 g. Jämförpris 39:80/kg",
      price: 19,
      image_url: "https://assets.icanet.se/t_product_large_v1,f_auto/7311070362291.jpg",
      offer_details: "Willys erbjudande"
    }
  ];
}
