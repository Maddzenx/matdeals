
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders, fetchAndParse, findOfferContainers, findAllOfferCards } from "./dom-utils.ts";
import { extractProducts } from "./extractors/product-extractor.ts";
import { storeProducts } from "./supabase-client.ts";

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("Starting ICA scraper function...");
    
    // URL of the webpage to scrape - try multiple ICA stores for redundancy
    const urls = [
      'https://www.ica.se/erbjudanden/ica-kvantum-sannegarden-1004293/',
      'https://www.ica.se/butiker/kvantum/goteborg/ica-kvantum-sannegarden-1004293/erbjudanden/',
      'https://www.ica.se/butiker/nara/goteborg/ica-nara-masthugget-1004251/erbjudanden/'
    ];
    
    const document = await fetchFromMultipleUrls(urls);
    
    // Find offer containers and cards
    console.log("Finding offer containers...");
    const offerContainers = findOfferContainers(document);
    
    console.log("Finding offer cards...");
    const offerCards = findAllOfferCards(document, offerContainers);
    
    if (offerCards.length === 0) {
      throw new Error("No offer cards found on the page. The website structure may have changed.");
    }
    
    // Extract products from offer cards
    console.log(`Extracting products from ${offerCards.length} offer cards...`);
    const products = extractProducts(offerCards, urls[0]);
    
    console.log(`Extracted ${products.length} products. First product: `, products[0]);
    
    if (products.length === 0) {
      throw new Error("No products could be extracted from the offer cards.");
    }
    
    // Filter out invalid products
    const validProducts = products.filter(p => 
      p.name && 
      p.price && 
      !p.name.toLowerCase().includes("lägg i inköpslista")
    );
    
    console.log(`Filtered to ${validProducts.length} valid products from ${products.length} total`);
    
    // Store products in Supabase
    console.log(`Storing ${validProducts.length} products in Supabase...`);
    const insertedCount = await storeProducts(validProducts);

    // Return success response
    console.log("Scraping completed successfully.");
    return new Response(
      JSON.stringify({
        success: true,
        message: `Refreshed all products from ICA website. Inserted ${insertedCount} new offers.`,
        products: validProducts.slice(0, 10) // Only send first 10 for response size
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
    
    // Return a more detailed error response
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || "Unknown error occurred",
        details: error.stack || "No stack trace available"
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

/**
 * Attempts to fetch from multiple URLs until one succeeds
 */
async function fetchFromMultipleUrls(urls: string[]) {
  let document = null;
  let lastError = null;
  
  // Try each URL until one works
  for (const url of urls) {
    try {
      console.log(`Attempting to fetch from: ${url}`);
      document = await fetchAndParse(url);
      if (document) {
        console.log(`Successfully fetched from: ${url}`);
        return document;
      }
    } catch (e) {
      lastError = e;
      console.error(`Failed to fetch from ${url}:`, e.message);
      // Continue to try the next URL
    }
  }
  
  throw lastError || new Error("Failed to fetch from any ICA URL");
}
