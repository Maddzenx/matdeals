
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

    // Looking for all offer containers which might contain multiple formats of offer cards
    const offerCards = [
      ...document.querySelectorAll('article.offer-card'),
      ...document.querySelectorAll('.offer-card-v3'),
      ...document.querySelectorAll('.offer-card-banner'),
      ...document.querySelectorAll('.product-card')
    ];
    
    console.log(`Found ${offerCards.length} offer elements to process`);

    const products = [];

    // Process each offer card
    for (const card of offerCards) {
      try {
        // Extract product name
        let name = null;
        const nameElement = card.querySelector('p.offer-card__title') || 
                            card.querySelector('.product-card__product-name') ||
                            card.querySelector('.offer-card-v3__title');
        
        if (nameElement) {
          name = nameElement.textContent.trim();
        }
        
        // Extract product description
        let description = null;
        const descriptionElement = card.querySelector('p.offer-card__text') || 
                                  card.querySelector('.product-card__product-subtitle') ||
                                  card.querySelector('.offer-card-v3__description');
        
        if (descriptionElement) {
          description = descriptionElement.textContent.trim();
        }
        
        // Extract product price
        let price = null;
        let priceStr = null;
        
        // Try multiple price element selectors
        const priceElement = card.querySelector('div.price-splash__text') || 
                            card.querySelector('.product-price') ||
                            card.querySelector('.offer-card-v3__price-value') ||
                            card.querySelector('.price-standard__value');
        
        if (priceElement) {
          const priceValue = priceElement.querySelector('span.price-splash__text__firstValue') ||
                            priceElement.querySelector('.price-standard__value') ||
                            priceElement;
          
          if (priceValue) {
            // Extract numeric part of the price, removing non-numeric characters except decimal point
            priceStr = priceValue.textContent.trim();
            const numericPrice = priceStr.replace(/[^\d,.]/g, '').replace(',', '.');
            price = numericPrice ? parseFloat(numericPrice) : null;
          }
        }
        
        // Extract product image URL
        let imageUrl = null;
        const imageElement = card.querySelector('img.offer-card__image-inner') || 
                            card.querySelector('.product-image img') ||
                            card.querySelector('.product-card__product-image img') ||
                            card.querySelector('.offer-card-v3__image');
        
        if (imageElement) {
          imageUrl = imageElement.getAttribute('src') || imageElement.getAttribute('data-src');
          
          // Make sure the URL is absolute
          if (imageUrl && !imageUrl.startsWith('http')) {
            imageUrl = new URL(imageUrl, url).href;
          }
        }
        
        if (name) {
          products.push({
            name,
            description,
            price,
            image_url: imageUrl
          });
          
          console.log(`Processed product: ${name} with price: ${price || 'unknown'} (${priceStr || 'no price found'})`);
        }
      } catch (cardError) {
        console.error("Error processing a card:", cardError);
        // Continue with the next card even if one fails
      }
    }

    console.log(`Successfully processed ${products.length} products out of ${offerCards.length} elements`);

    if (products.length === 0) {
      console.error("No products were found. HTML structure might have changed.");
      throw new Error("No products found on the page. The website structure may have changed.");
    }

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

    // Insert all new products
    const { error: insertError } = await supabase
      .from('ICA')
      .insert(products);
    
    if (insertError) {
      console.error("Error inserting new products:", insertError);
      throw insertError;
    }
    
    console.log(`Successfully inserted ${products.length} new products`);

    return new Response(
      JSON.stringify({
        success: true,
        message: `Refreshed all products from ICA website. Inserted ${products.length} new offers.`,
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
