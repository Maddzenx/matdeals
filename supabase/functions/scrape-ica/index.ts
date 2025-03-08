
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { DOMParser } from "https://deno.land/x/deno_dom/deno-dom-wasm.ts";

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Create Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY") || "";
    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    // URL of the webpage to scrape
    const url = 'https://www.ica.se/erbjudanden/ica-kvantum-sannegarden-1004293/';

    console.log("Fetching ICA website data from:", url);
    // Fetch the webpage content
    const response = await fetch(url);
    const html = await response.text();

    // Parse the HTML
    const parser = new DOMParser();
    const document = parser.parseFromString(html, "text/html");
    
    if (!document) {
      throw new Error("Failed to parse HTML document");
    }

    // Find all offer cards on the page
    const offerCards = document.querySelectorAll('article.offer-card');
    
    console.log(`Found ${offerCards.length} offer cards`);

    const products = [];

    // Process each offer card
    for (const card of offerCards) {
      // Extract product name
      const nameElement = card.querySelector('p.offer-card__title');
      const name = nameElement ? nameElement.textContent.trim() : null;
      
      // Extract product description
      const descriptionElement = card.querySelector('p.offer-card__text');
      const description = descriptionElement ? descriptionElement.textContent.trim() : null;
      
      // Extract product price
      const priceElement = card.querySelector('div.price-splash__text');
      let price = null;
      
      if (priceElement) {
        const priceValue = priceElement.querySelector('span.price-splash__text__firstValue');
        const priceSuffix = priceElement.querySelector('div.price-splash__text__suffix');
        
        if (priceValue) {
          // Extract numeric part of the price, removing non-numeric characters
          const priceText = priceValue.textContent.trim();
          const numericPrice = priceText.replace(/[^0-9]/g, '');
          price = numericPrice ? parseInt(numericPrice, 10) : null;
        }
      }
      
      // Extract product image URL
      const imageElement = card.querySelector('img.offer-card__image-inner');
      const imageUrl = imageElement ? imageElement.getAttribute('src') : null;
      
      if (name) {
        products.push({
          name,
          description,
          price,
          image_url: imageUrl
        });
        
        console.log(`Processed product: ${name} with price: ${price}`);
      }
    }

    // Update or insert products in the ICA table
    for (const product of products) {
      // First check if the product already exists
      const { data: existingProducts, error: queryError } = await supabase
        .from('ICA')
        .select('*')
        .eq('name', product.name);

      if (queryError) {
        console.error(`Error querying product ${product.name}:`, queryError);
        continue;
      }

      if (existingProducts && existingProducts.length > 0) {
        // Update existing product
        const { error: updateError } = await supabase
          .from('ICA')
          .update({
            description: product.description,
            price: product.price,
            image_url: product.image_url
          })
          .eq('name', product.name);

        if (updateError) {
          console.error(`Error updating product ${product.name}:`, updateError);
        } else {
          console.log(`Updated product: ${product.name}`);
        }
      } else {
        // Insert new product
        const { error: insertError } = await supabase
          .from('ICA')
          .insert(product);

        if (insertError) {
          console.error(`Error inserting product ${product.name}:`, insertError);
        } else {
          console.log(`Inserted new product: ${product.name}`);
        }
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: `Processed ${products.length} products from ICA website`,
        products
      }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      }
    );

  } catch (error) {
    console.error("Error scraping ICA website:", error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message
      }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      }
    );
  }
});
