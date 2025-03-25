
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
    console.log("Starting Willys scraper function...");
    
    // Parse request body to check for forceRefresh flag and target store
    let forceRefresh = false;
    let source = "unknown";
    let target = "willys-johanneberg"; // Default to Willys Johanneberg since it's our only table
    
    try {
      const body = await req.json();
      forceRefresh = body?.forceRefresh || false;
      source = body?.source || "unknown";
      target = body?.target || "willys-johanneberg";
      console.log(`ForceRefresh flag: ${forceRefresh}, Source: ${source}, Target: ${target}`);
    } catch (e) {
      console.log("No valid JSON body or forceRefresh flag");
    }
    
    // Generate some sample products for the Willys Johanneberg table
    // since we don't have real scraping logic for this specific store
    console.log(`Generating sample products for Willys Johanneberg...`);
    
    const sampleProducts = createSampleProducts("willys johanneberg", 25);
    console.log(`Created ${sampleProducts.length} sample products for Willys Johanneberg`);
    
    // Add some store-specific information 
    const enhancedProducts = sampleProducts.map((product, index) => {
      return {
        ...product,
        // These match the actual column names in the Willys Johanneberg table
        "Product Name": `${product.name} - Special Offer`,
        "Brand and Weight": product.description || "Various weights",
        "Price": product.price,
        "Product Image": product.image_url,
        "Label 1": "Weekly Deal",
        "Label 2": "Limited Stock",
        "Savings": "Save 20%",
        "Unit Price": `${(Number(product.price) * 1.2).toFixed(2)} per kg`,
        "Position": index + 1,
        store: "willys johanneberg"
      };
    });
    
    console.log("Enhanced products example:", enhancedProducts[0]);
    
    // Store the products in the Willys Johanneberg table
    try {
      console.log(`Storing ${enhancedProducts.length} products in Willys Johanneberg table...`);
      
      const insertedCount = await storeProducts(enhancedProducts);
      console.log(`Successfully stored ${insertedCount} products in Willys Johanneberg table`);
      
      // Return success response
      return createSuccessResponse(
        `Successfully generated and stored ${insertedCount} sample products for Willys Johanneberg.`,
        enhancedProducts
      );
    } catch (dbError) {
      console.error("Error storing products in database:", dbError);
      return createErrorResponse(dbError, enhancedProducts);
    }

  } catch (error) {
    console.error("Error in Willys Johanneberg scraper:", error);
    
    // Create and store fallback products even when there's an error
    console.log("Error occurred during scraping. Using sample products as fallback...");
    const sampleProducts = createSampleProducts("willys johanneberg");
    
    try {
      const insertedCount = await storeProducts(sampleProducts);
      console.log(`Stored ${insertedCount} fallback products in database`);
    } catch (dbError) {
      console.error("Error storing fallback products:", dbError);
    }
    
    return createErrorResponse(error, sampleProducts);
  }
});
