
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from "./utils/http-util.ts";
import { storeRecipes } from "./utils/supabase-client.ts";
import { scrapeRecipesFromICA } from "./scrapers/ica-scraper.ts";
import { scrapeRecipesFromCoop } from "./scrapers/coop-scraper.ts";
import { createMockRecipes } from "./mock/mock-recipes.ts";

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
    
    // Try to scrape from the web
    console.log("Attempting to scrape recipes from websites...");
    let recipes: any[] = [];
    
    try {
      // Try to scrape from ICA first
      const icaRecipes = await scrapeRecipesFromICA();
      if (icaRecipes.length > 0) {
        console.log(`Successfully scraped ${icaRecipes.length} recipes from ICA`);
        recipes = [...recipes, ...icaRecipes];
      }
      
      // If we don't have enough recipes, try scraping from Coop
      if (recipes.length < 30) {
        const coopRecipes = await scrapeRecipesFromCoop();
        if (coopRecipes.length > 0) {
          console.log(`Successfully scraped ${coopRecipes.length} recipes from Coop`);
          recipes = [...recipes, ...coopRecipes];
        }
      }
    } catch (scrapeError) {
      console.error("Error during web scraping:", scrapeError);
    }
    
    // If we couldn't scrape any recipes, fall back to mock data
    if (recipes.length === 0) {
      console.log("Web scraping failed or returned no results, using mock data");
      recipes = createMockRecipes();
    }
    
    console.log(`Total recipes for storage: ${recipes.length}`);
    
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
