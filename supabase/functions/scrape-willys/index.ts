
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { DOMParser } from "https://deno.land/x/deno_dom/deno-dom-wasm.ts";
import { corsHeaders } from "./cors.ts";
import { storeProducts } from "./supabase-client.ts";
import { extractProducts } from "./products-extractor.ts";

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("Starting Willys scraper function...");
    
    // URL of the webpage to scrape
    const url = 'https://www.willys.se/erbjudanden/butik';
    
    console.log(`Fetching from: ${url}`);
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
      }
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch with status: ${response.status}`);
    }
    
    const html = await response.text();
    
    // Parse the HTML
    const parser = new DOMParser();
    const document = parser.parseFromString(html, "text/html");
    
    if (!document) {
      throw new Error("Failed to parse HTML document");
    }
    
    console.log("Finding offer elements...");
    
    // Find product containers
    const productCards = document.querySelectorAll('.product-list-item, .product-tile, .offer-card, [class*="product-"]');
    console.log(`Found ${productCards.length} product elements`);
    
    if (productCards.length === 0) {
      // Try more generic selectors if specific ones didn't work
      const alternativeCards = document.querySelectorAll('article, [class*="offer"], [class*="product"], .grid-item');
      console.log(`Found ${alternativeCards.length} alternative product elements`);
      
      if (alternativeCards.length === 0) {
        throw new Error("No product cards found on the page. The website structure may have changed.");
      }
    }
    
    // Extract products from the document
    const products = extractProducts(document, url);
    console.log(`Extracted ${products.length} products`);
    
    if (products.length === 0) {
      throw new Error("No products could be extracted from the page.");
    }
    
    // Store products in Supabase
    console.log(`Storing ${products.length} products in Supabase...`);
    const insertedCount = await storeProducts(products);

    // Return success response
    return new Response(
      JSON.stringify({
        success: true,
        message: `Refreshed all products from Willys website. Inserted ${insertedCount} new offers.`,
        products: products.slice(0, 10) // Only send first 10 for response size
      }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      }
    );

  } catch (error) {
    console.error("Error scraping Willys website:", error);
    
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
