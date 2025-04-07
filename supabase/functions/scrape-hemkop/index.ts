
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from "./cors.ts";
import { storeProducts } from "./supabase-client.ts";
import { extractProducts } from "./products-extractor.ts";
import { createSampleProducts } from "./extractors/fallback-extractor.ts";
import { fetchHtmlContent } from "./utils/dom-utils.ts";
import { createSuccessResponse, createErrorResponse } from "./utils/response-utils.ts";
import { HEMKOP_URLS, USER_AGENTS, BASE_URL } from "./config/scraper-config.ts";

serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("Starting Hemköp scraper function...");
    
    // Parse request body to check for forceRefresh flag
    let forceRefresh = false;
    
    try {
      const body = await req.json();
      forceRefresh = body?.forceRefresh || false;
      console.log(`ForceRefresh flag: ${forceRefresh}`);
    } catch (e) {
      console.log("No valid JSON body or forceRefresh flag");
    }
    
    // Try each URL in the config with different user agents
    let allProducts: any[] = [];
    let successfulUrl = "";
    
    for (const url of HEMKOP_URLS) {
      console.log(`Attempting to scrape from URL: ${url}`);
      
      // Fetch HTML content using the utility function
      const { document, html, fetchSuccess } = await fetchHtmlContent([url], USER_AGENTS, forceRefresh);
      
      if (fetchSuccess && document) {
        console.log(`Successfully fetched content from ${url}, extracting products...`);
        
        // Extract products using the modular extractor
        const products = extractProducts(document, BASE_URL);
        
        console.log(`Extracted ${products.length} products from page`);
        
        // If products were found, store them and return success
        if (products && products.length > 0) {
          allProducts = products;
          successfulUrl = url;
          break;
        } else {
          console.log(`No products found from ${url}, trying next URL...`);
        }
      } else {
        console.log(`Failed to fetch content from ${url}, trying next URL...`);
      }
    }
    
    // If we've found products, store them
    if (allProducts.length > 0) {
      console.log(`Found ${allProducts.length} products from ${successfulUrl}, storing in database`);
      const insertedCount = await storeProducts(allProducts);
      console.log(`Stored ${insertedCount} products in database`);

      // Return success response
      return createSuccessResponse(
        `Successfully extracted and stored ${insertedCount} products from Hemköp website (${successfulUrl}).`,
        allProducts
      );
    }
    
    // If we've tried all URLs and no products were found, use sample products
    console.log("Failed to fetch and extract products from all URLs, using fallback products");
    const sampleProducts = createSampleProducts();
    const insertedCount = await storeProducts(sampleProducts);
    
    return createSuccessResponse(
      `Failed to fetch Hemköp website. Using ${insertedCount} fallback products instead.`,
      sampleProducts
    );

  } catch (error) {
    console.error("Error scraping Hemköp website:", error);
    
    // Create and store fallback products even when there's an error
    console.log("Error occurred during scraping. Using sample products as fallback...");
    const sampleProducts = createSampleProducts();
    
    try {
      const insertedCount = await storeProducts(sampleProducts);
      console.log(`Stored ${insertedCount} fallback products after error`);
    } catch (storeError) {
      console.error("Error storing fallback products:", storeError);
    }
    
    // Cast the unknown error to Error type using type assertion
    return createErrorResponse(error as Error, sampleProducts);
  }
});
