
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { fetchHtmlContent } from "./utils/dom-utils.ts";
import { corsHeaders } from "./cors.ts";
import { upsertProducts } from "./supabase-client.ts";
import { extractProductsFromHTML } from "./products-extractor.ts";

// Configuration for the scraper
import { scrapeConfig } from "./config/scraper-config.ts";

// Handle requests
serve(async (req: any) => {
  // Handle preflight CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  // For any method except GET, require a provided URL in request body
  let providedUrl: string | null = null;
  let forceRefresh = false;
  
  if (req.method !== 'GET') {
    try {
      const body = await req.json();
      providedUrl = body.url;
      forceRefresh = body.forceRefresh === true;
    } catch {
      // Ignore errors, just continue with default configuration
    }
  }

  try {
    const startTime = Date.now();
    console.log(`Starting Hemköp scraping at ${new Date().toISOString()}`);
    
    // Get the URLs to try, either from request or config
    const urlsToTry = providedUrl 
      ? [providedUrl] 
      : scrapeConfig.hemkop.urlsToTry;
    
    console.log(`Will try the following URLs: ${urlsToTry.join(', ')}`);

    // Fetch the HTML content with our utility
    const { document, html, fetchSuccess } = await fetchHtmlContent(
      urlsToTry,
      scrapeConfig.hemkop.userAgents,
      forceRefresh
    );
    
    if (!fetchSuccess || !html) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Failed to fetch valid HTML content",
          htmlLength: html?.length || 0
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400
        }
      );
    }
    
    console.log(`Successfully fetched HTML content, length: ${html.length} chars`);
    
    // Extract products
    const products = extractProductsFromHTML(html);
    
    console.log(`Extracted ${products.length} products from HTML`);
    
    // Store products in the database if we have any
    let dbResult = { success: false, count: 0 };
    
    if (products.length > 0) {
      console.log(`Storing ${products.length} products in the database...`);
      dbResult = await upsertProducts(products, "hemkop");
      console.log(`Database result: ${JSON.stringify(dbResult)}`);
    }
    
    const endTime = Date.now();
    const duration = (endTime - startTime) / 1000;
    
    console.log(`Hemköp scraping completed in ${duration} seconds`);
    
    return new Response(
      JSON.stringify({
        success: true,
        productCount: products.length,
        dbResult,
        duration
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    );
    
  } catch (error: any) {
    console.error("Error in Hemkop scraper:", error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : "Unknown error occurred",
        stack: error instanceof Error ? error.stack : undefined
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    );
  }
});
