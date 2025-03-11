
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders, fetchAndParse, findOfferContainers, findAllOfferCards } from "./dom-utils.ts";
import { extractProducts } from "./product-extractor.ts";
import { storeProducts } from "./supabase-client.ts";

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // URL of the webpage to scrape
    const url = 'https://www.ica.se/erbjudanden/ica-kvantum-sannegarden-1004293/';

    // Fetch and parse the HTML document
    const document = await fetchAndParse(url);
    
    // Find offer containers and cards
    const offerContainers = findOfferContainers(document);
    const offerCards = findAllOfferCards(document, offerContainers);
    
    // Extract products from offer cards
    const products = extractProducts(offerCards, url);
    
    // Store products in Supabase
    const insertedCount = await storeProducts(products);

    // Return success response
    return new Response(
      JSON.stringify({
        success: true,
        message: `Refreshed all products from ICA website. Inserted ${insertedCount} new offers.`,
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
