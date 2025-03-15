import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { DOMParser } from "https://deno.land/x/deno_dom@v0.1.38/deno-dom-wasm.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// CORS headers for browser requests
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Create Supabase client
function createSupabaseClient() {
  const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
  const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
  
  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error("Missing Supabase credentials");
  }
  
  console.log("Creating Supabase client with service role key");
  
  // Use the service role key to bypass RLS policies
  return createClient(supabaseUrl, supabaseServiceKey);
}

// Enhanced fetch with retries and user agent rotation
async function enhancedFetch(url: string, retries = 3): Promise<Response> {
  const userAgents = [
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.1.1 Safari/605.1.15",
    "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/92.0.4515.107 Safari/537.36"
  ];
  
  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      const userAgent = userAgents[Math.floor(Math.random() * userAgents.length)];
      console.log(`Attempt ${attempt + 1} fetching: ${url} with user agent: ${userAgent.substring(0, 20)}...`);
      
      const response = await fetch(url, {
        headers: {
          "User-Agent": userAgent,
          "Accept": "text/html,application/xhtml+xml,application/xml",
          "Accept-Language": "en-US,en;q=0.9,sv;q=0.8",
          "Cache-Control": "no-cache"
        },
      });
      
      if (!response.ok) {
        const statusText = await response.text();
        console.error(`HTTP error: ${response.status} ${response.statusText}. First 100 chars: ${statusText.substring(0, 100)}`);
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      return response;
    } catch (error) {
      console.error(`Attempt ${attempt + 1} failed:`, error);
      if (attempt === retries - 1) throw error;
      // Wait a bit before retrying
      await new Promise(r => setTimeout(r, 1000 * (attempt + 1)));
    }
  }
  
  throw new Error("All fetch attempts failed");
}

// Fetch and parse HTML
async function fetchAndParse(url: string) {
  try {
    console.log(`Fetching URL: ${url}`);
    const response = await enhancedFetch(url);
    
    const html = await response.text();
    
    // Log a small sample of the HTML to debug
    console.log(`HTML sample (first 300 chars): ${html.substring(0, 300)}...`);
    
    const parser = new DOMParser();
    const document = parser.parseFromString(html, "text/html");
    
    if (!document) {
      throw new Error("Failed to parse HTML document");
    }
    
    return document;
  } catch (error) {
    console.error(`Error fetching ${url}:`, error);
    throw error;
  }
}

// Create mock recipe data with valid UUIDs
function createMockRecipes() {
  console.log("Creating mock recipes as fallback");
  return [
    {
      id: crypto.randomUUID(),
      title: "Vegetarisk Lasagne",
      description: "En krämig och läcker vegetarisk lasagne med spenat och svamp.",
      image_url: "https://images.unsplash.com/photo-1574894709920-11b28e7367e3?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80",
      time_minutes: 60,
      servings: 4,
      difficulty: "Medel",
      ingredients: ["Lasagneplattor", "Spenat", "Svamp", "Ricotta", "Tomatsås", "Ost"],
      instructions: ["Förbered grönsakerna", "Varva lasagneplattor med fyllning", "Grädda i ugn"],
      tags: ["Vegetariskt", "Matlådevänligt", "Budget"],
      source_url: "https://www.godare.se/recept/vegetarisk-lasagne",
      category: "Vegetariskt",
      price: 65,
      original_price: 78
    },
    {
      id: crypto.randomUUID(),
      title: "Kycklinggryta med curry",
      description: "En smakrik kycklinggryta med härlig currysås och grönsaker.",
      image_url: "https://images.unsplash.com/photo-1574653853027-5382a3d23a15?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80",
      time_minutes: 45,
      servings: 4,
      difficulty: "Lätt",
      ingredients: ["Kycklingfilé", "Curry", "Kokosmjölk", "Paprika", "Lök", "Ris"],
      instructions: ["Stek kycklingen", "Tillsätt grönsaker och kryddor", "Häll i kokosmjölk", "Låt sjuda"],
      tags: ["Kyckling", "Snabbt", "Matlådevänligt"],
      source_url: "https://www.godare.se/recept/kycklinggryta-med-curry",
      category: "Middag",
      price: 75,
      original_price: 90
    },
    {
      id: crypto.randomUUID(),
      title: "Köttbullar med potatismos",
      description: "Klassiska svenska köttbullar med krämigt potatismos och lingonsylt.",
      image_url: "https://images.unsplash.com/photo-1598511757337-fe2cafc51144?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80",
      time_minutes: 50,
      servings: 4,
      difficulty: "Medel",
      ingredients: ["Köttfärs", "Lök", "Ströbröd", "Potatis", "Mjölk", "Lingonsylt"],
      instructions: ["Blanda köttfärssmeten", "Rulla köttbullar", "Stek köttbullar", "Koka potatis och gör potatismos"],
      tags: ["Klassiskt", "Matlådevänligt", "Budget"],
      source_url: "https://www.godare.se/recept/kottbullar-med-potatismos",
      category: "Middag",
      price: 70,
      original_price: 85
    }
  ];
}

// Store recipes in Supabase
async function storeRecipes(recipes: any[]) {
  if (!recipes || recipes.length === 0) {
    console.log("No recipes to store");
    return 0;
  }
  
  const supabase = createSupabaseClient();
  
  try {
    console.log(`Storing ${recipes.length} recipes in Supabase...`);
    
    // Clear existing recipes first
    console.log("Clearing existing recipes");
    const { error: deleteError } = await supabase
      .from('recipes')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000'); // Safe condition
      
    if (deleteError) {
      console.error("Error clearing existing recipes:", deleteError);
      throw deleteError;
    }
    
    console.log("Successfully cleared existing recipes.");
    
    // Insert new recipes
    let successCount = 0;
    const batchSize = 5; // Increased batch size from 1 to 5
    
    for (let i = 0; i < recipes.length; i += batchSize) {
      const batch = recipes.slice(i, i + batchSize);
      console.log(`Processing batch ${i/batchSize + 1}/${Math.ceil(recipes.length/batchSize)}`);
      
      const { data, error: insertError } = await supabase
        .from('recipes')
        .insert(batch)
        .select();
        
      if (insertError) {
        console.error(`Error inserting batch of recipes:`, insertError);
        console.error("Error details:", JSON.stringify(insertError));
      } else {
        console.log(`Successfully inserted batch of ${data?.length || 0} recipes`);
        successCount += data?.length || 0;
      }
    }
    
    console.log(`Successfully inserted ${successCount} of ${recipes.length} recipes`);
    return successCount;
  } catch (error) {
    console.error("Error storing recipes in Supabase:", error);
    throw error;
  }
}

// Main function
serve(async (req) => {
  console.log("Request received for scrape-recipes function");
  console.log("Request method:", req.method);
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }
  
  try {
    console.log("Starting recipe scraper function...");
    
    // For now, use mock data to ensure we have something to show
    const recipes = createMockRecipes();
    console.log(`Generated ${recipes.length} mock recipes`);
    
    // Store recipes in Supabase
    const insertedCount = await storeRecipes(recipes);
    
    if (insertedCount === 0) {
      return new Response(
        JSON.stringify({
          success: false,
          message: "Failed to insert any recipes into the database",
          error: "Database insertion failed",
          recipesCount: 0
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
    
    // Return success response
    return new Response(
      JSON.stringify({
        success: true,
        message: `Successfully stored ${insertedCount} recipes`,
        recipesCount: insertedCount
      }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      }
    );
  } catch (error) {
    console.error("Error in recipe scraper:", error);
    
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
