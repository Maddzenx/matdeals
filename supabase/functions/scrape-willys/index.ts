
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from "./cors.ts";
import { storeProducts } from "./supabase-client.ts";
import { extractProducts } from "./products-extractor.ts";
import { createSampleProducts } from "./extractors/fallback-extractor.ts";
import { fetchHtmlContent } from "./utils/dom-utils.ts";
import { createSuccessResponse, createErrorResponse } from "./utils/response-utils.ts";
import { WILLYS_URLS, USER_AGENTS, BASE_URL, STORE_NAME } from "./config/scraper-config.ts";

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("Starting Willys Johanneberg scraper function...");
    
    // Parse request body to check for forceRefresh flag
    let forceRefresh = false;
    
    try {
      const body = await req.json();
      forceRefresh = body?.forceRefresh || false;
      console.log(`ForceRefresh flag: ${forceRefresh}`);
    } catch (e) {
      console.log("No valid JSON body or forceRefresh flag");
    }
    
    // Fetch HTML content using the utility function
    const { document, fetchSuccess } = await fetchHtmlContent(WILLYS_URLS, USER_AGENTS, forceRefresh);
    
    if (!fetchSuccess || !document) {
      console.log("Failed to fetch and parse content from Willys Johanneberg website, using fallback products");
      const sampleProducts = createSampleProducts(STORE_NAME);
      const insertedCount = await storeProducts(sampleProducts);
      
      return createSuccessResponse(
        `Failed to fetch Willys Johanneberg website. Using ${insertedCount} fallback products instead.`,
        sampleProducts
      );
    }
    
    console.log("Document parsed successfully, extracting products for Johanneberg store...");
    
    // Extract products using the modular extractor
    const products = extractProducts(document, BASE_URL, STORE_NAME);
    
    console.log(`Extracted ${products.length} products from Johanneberg store page`);
    
    // Explicitly set the store name for all products
    products.forEach(product => {
      product.store = STORE_NAME;
    });
    
    // If no products were found, use sample products
    if (!products || products.length === 0) {
      console.log("No products found for Johanneberg store. Using sample products...");
      const sampleProducts = createSampleProducts(STORE_NAME);
      
      // Store sample products in Supabase
      const insertedCount = await storeProducts(sampleProducts);
      
      return createSuccessResponse(
        `No products found on Willys Johanneberg website. Using ${insertedCount} sample products instead.`,
        sampleProducts
      );
    }
    
    console.log("About to store Johanneberg products in database");
    // Store products in Supabase
    const insertedCount = await storeProducts(products);
    console.log(`Stored ${insertedCount} Johanneberg products in database`);

    // Return success response
    return createSuccessResponse(
      `Successfully extracted and stored ${insertedCount} products from Willys Johanneberg.`,
      products
    );

  } catch (error) {
    console.error("Error scraping Willys Johanneberg website:", error);
    
    // Create and store fallback products even when there's an error
    console.log("Error occurred during scraping. Using sample products as fallback...");
    const sampleProducts = createSampleProducts(STORE_NAME);
    const insertedCount = await storeProducts(sampleProducts);
    
    return createErrorResponse(error, sampleProducts);
  }
});
