
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from "../shared/cors.ts";
import { extractProducts } from "./products-extractor.ts";
import { storeProducts, Product } from "../shared/product-storage.ts";

// Define the function handler
serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }
  
  try {
    // Extract request parameters
    const { forceRefresh = false, source = "unknown", target = "willys" } = await req.json();
    console.log(`Scrape request received - forceRefresh: ${forceRefresh}, source: ${source}, target: ${target}`);
    
    // Get Supabase credentials from environment
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
    
    if (!supabaseUrl || !supabaseKey) {
      throw new Error("Missing Supabase credentials");
    }
    
    // Fetch the Willys webpage
    console.log("Fetching Willys webpage...");
    const response = await fetch("https://www.willys.se/butik/1214/erbjudanden");
    
    if (!response.ok) {
      throw new Error(`Failed to fetch Willys webpage: ${response.status} ${response.statusText}`);
    }
    
    const html = await response.text();
    console.log(`Successfully fetched Willys webpage (${html.length} bytes)`);
    
    // Extract products from the HTML - passing html as string since our extractor can handle it
    console.log("Extracting products from HTML...");
    const extractorResults = await extractProducts(html, target, "johanneberg");
    console.log(`Extracted ${extractorResults.length} products from HTML`);
    
    // Convert ExtractorResult to Product
    const products: Product[] = extractorResults.map(result => ({
      product_name: result.name,
      description: result.description,
      price: result.price ? parseFloat(String(result.price).replace(',', '.').replace('kr', '').trim()) : null,
      original_price: result.original_price ? parseFloat(String(result.original_price).replace(',', '.').replace('kr', '').trim()) : null,
      image_url: result.image_url,
      offer_details: result.offer_details,
      label: result.offer_details,
      unit_price: result.comparison_price,
      store: result.store || "willys",
      store_location: result.store_location || "johanneberg",
      position: result.index || 1
    }));
    
    // Store products in the database
    const insertedCount = await storeProducts(
      supabaseUrl,
      supabaseKey,
      products,
      "willys",
      "johanneberg"
    );
    
    console.log(`Successfully stored ${insertedCount} products in the database`);
    
    // Return success response
    return new Response(
      JSON.stringify({
        success: true,
        products: extractorResults,
        message: `Successfully extracted ${extractorResults.length} products and stored ${insertedCount}`
      }),
      {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json"
        }
      }
    );
  } catch (error) {
    console.error("Error in scrape-willys function:", error);

    // If scraper fails, try to store sample products
    try {
      console.log("Trying to store sample products as fallback...");
      
      // Import the createSampleProducts function
      const { createSampleProducts } = await import("./extractors/fallback-extractor.ts");
      const sampleProducts = createSampleProducts("willys");
      
      // Get Supabase credentials
      const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
      const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
      
      if (!supabaseUrl || !supabaseKey) {
        throw new Error("Missing Supabase credentials");
      }
      
      // Convert to Product format
      const products: Product[] = sampleProducts.map((result, index) => ({
        product_name: result.name,
        description: result.description || null,
        price: result.price ? parseFloat(String(result.price).replace(',', '.').replace('kr', '').trim()) : null,
        original_price: result.original_price ? parseFloat(String(result.original_price).replace(',', '.').replace('kr', '').trim()) : null,
        image_url: result.image_url,
        offer_details: result.offer_details,
        label: result.offer_details,
        unit_price: result.comparison_price || null,
        store: "willys",
        store_location: "johanneberg",
        position: index + 1
      }));
      
      // Store sample products
      const insertedCount = await storeProducts(
        supabaseUrl,
        supabaseKey,
        products,
        "willys",
        "johanneberg"
      );
      
      console.log(`Successfully stored ${insertedCount} sample products as fallback`);
      
      return new Response(
        JSON.stringify({
          success: false,
          products: sampleProducts,
          message: `Scraper error: ${error instanceof Error ? error.message : 'Unknown error'}. Stored ${insertedCount} sample products as fallback.`
        }),
        {
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json"
          }
        }
      );
    } catch (fallbackError) {
      console.error("Fallback also failed:", fallbackError);
      
      // Return error response
      return new Response(
        JSON.stringify({
          success: false,
          message: `Error: ${error instanceof Error ? error.message : 'Unknown error'}. Fallback also failed: ${fallbackError instanceof Error ? fallbackError.message : 'Unknown error'}`
        }),
        {
          status: 500,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json"
          }
        }
      );
    }
  }
});
