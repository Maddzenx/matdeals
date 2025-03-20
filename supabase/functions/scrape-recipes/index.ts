
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from "../scrape-willys/cors.ts";
import { createSupabaseClient, storeRecipes } from "./utils/supabase-client.ts";
import { scrapeCoopRecipes } from "./scrapers/coop-scraper.ts";
import { scrapeIcaRecipes } from "./scrapers/ica-scraper.ts";
import { mockRecipes } from "./mock/mock-recipes.ts";

console.log("Hello from Supabase Edge Function - Recipes Scraper!");

const isMockMode = Deno.env.get("MOCK_MODE") === "true";

serve(async (req) => {
  // Handle CORS
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    let body;
    try {
      body = await req.json();
    } catch (e) {
      // If no body is provided, use an empty object
      body = {};
    }

    // Check if a specific recipe ID was provided
    const specificRecipeId = body.recipeId;
    
    if (specificRecipeId) {
      console.log(`Request to scrape specific recipe with ID: ${specificRecipeId}`);
      
      // Here we would typically implement logic to scrape just one recipe
      // For now, we'll scrape all recipes and filter the one we need
      
      // In a real implementation, you might want to check which source the recipe is from
      // and only call that specific scraper with the URL from the recipe
      
      let recipes;
      if (isMockMode) {
        console.log("Using mock recipes data");
        recipes = mockRecipes;
      } else {
        console.log("Scraping live recipes data");
        // Fetch from multiple sources
        const [coopRecipes, icaRecipes] = await Promise.all([
          scrapeCoopRecipes(),
          scrapeIcaRecipes(),
        ]);
        
        recipes = [...coopRecipes, ...icaRecipes];
      }
      
      // Create Supabase client
      const supabase = createSupabaseClient();
      
      // Check if the recipe exists
      const { data: existingRecipe } = await supabase
        .from('recipes')
        .select('id, source_url')
        .eq('id', specificRecipeId)
        .maybeSingle();
        
      if (!existingRecipe) {
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: `Recipe with ID ${specificRecipeId} not found` 
          }),
          { 
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 404 
          }
        );
      }
      
      // Find the matching recipe in our scraped data
      // This is a simplified approach - in a real implementation you'd want to scrape just this one recipe
      const matchedRecipe = recipes.find(r => 
        r.source_url === existingRecipe.source_url || 
        r.title.toLowerCase() === existingRecipe.title?.toLowerCase()
      );
      
      if (!matchedRecipe) {
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: "Could not find matching recipe data in source" 
          }),
          { 
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 404 
          }
        );
      }
      
      // Update just this one recipe
      const { data, error } = await supabase
        .from('recipes')
        .update({
          ...matchedRecipe,
          id: specificRecipeId // Keep the original ID
        })
        .eq('id', specificRecipeId)
        .select();
        
      if (error) {
        throw error;
      }
      
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: "Recipe updated successfully",
          recipe: data[0]
        }),
        { 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    }
    
    // If no specific recipe ID was provided, scrape all recipes as before
    console.log("Attempting to scrape recipes from websites...");
    
    let recipes;
    if (isMockMode) {
      console.log("Using mock recipes data");
      recipes = mockRecipes;
    } else {
      console.log("Scraping live recipes data");
      // Fetch from multiple sources
      const [coopRecipes, icaRecipes] = await Promise.all([
        scrapeCoopRecipes(),
        scrapeIcaRecipes(),
      ]);
      
      recipes = [...coopRecipes, ...icaRecipes];
    }
    
    console.log(`Scraped ${recipes.length} recipes total`);
    
    // Store recipes in database
    const storedCount = await storeRecipes(recipes);
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        recipesCount: storedCount, 
        message: `Successfully stored ${storedCount} recipes` 
      }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  } catch (error) {
    console.error("Error in edge function:", error);
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || "Unknown error occurred" 
      }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500 
      }
    );
  }
});
