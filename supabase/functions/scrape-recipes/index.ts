
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
  const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY") || "";
  
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error("Missing Supabase credentials");
  }
  
  return createClient(supabaseUrl, supabaseAnonKey);
}

// Fetch and parse HTML
async function fetchAndParse(url: string) {
  try {
    console.log(`Fetching URL: ${url}`);
    const response = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
      },
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch ${url}: ${response.status} ${response.statusText}`);
    }
    
    const html = await response.text();
    const parser = new DOMParser();
    return parser.parseFromString(html, "text/html");
  } catch (error) {
    console.error(`Error fetching ${url}:`, error);
    throw error;
  }
}

// Extract category name from URL
function getCategoryFromUrl(url: string): string {
  const match = url.match(/\/recept\/([^/]+)/);
  if (match && match[1]) {
    const category = match[1]
      .replace(/-/g, ' ')
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
    return category;
  }
  return "Övrigt"; // Default category
}

// Scrape recipe data from godare.se
async function scrapeRecipes() {
  const baseUrl = "https://www.godare.se";
  const categoryUrls = [
    "/recept/middag",
    "/recept/vegetariskt",
    "/recept/vegan",
    "/recept/bakning",
    "/recept/mat-och-matlagning/snabb-mat"
  ];
  
  const allRecipes = [];
  
  for (const categoryUrl of categoryUrls) {
    try {
      const fullUrl = baseUrl + categoryUrl;
      console.log(`Scraping category: ${fullUrl}`);
      
      const document = await fetchAndParse(fullUrl);
      const recipeCards = document.querySelectorAll(".recipe-card");
      
      console.log(`Found ${recipeCards.length} recipe cards in ${fullUrl}`);
      
      const category = getCategoryFromUrl(categoryUrl);
      
      // Limit to 5 recipes per category to avoid timeouts
      const limit = Math.min(recipeCards.length, 5);
      
      for (let i = 0; i < limit; i++) {
        const card = recipeCards[i];
        
        // Extract basic recipe info from card
        const titleElement = card.querySelector(".recipe-card__title");
        const linkElement = card.querySelector("a.recipe-card__link");
        const imageElement = card.querySelector("img");
        
        if (!titleElement || !linkElement) {
          console.log("Missing title or link element, skipping recipe");
          continue;
        }
        
        const title = titleElement.textContent.trim();
        const recipeUrl = linkElement.getAttribute("href");
        const fullRecipeUrl = recipeUrl.startsWith("http") ? recipeUrl : baseUrl + recipeUrl;
        const imageUrl = imageElement?.getAttribute("src") || "";
        
        console.log(`Processing recipe: ${title} at ${fullRecipeUrl}`);
        
        try {
          // Fetch detailed recipe page
          const recipeDoc = await fetchAndParse(fullRecipeUrl);
          
          // Extract recipe details
          const timeElement = recipeDoc.querySelector(".recipe-meta__item--time");
          const servingsElement = recipeDoc.querySelector(".recipe-meta__item--portions");
          const ingredientElements = recipeDoc.querySelectorAll(".recipe-ingredients__list-item");
          const instructionElements = recipeDoc.querySelectorAll(".recipe-instructions__list-item");
          
          const timeMinutes = timeElement 
            ? parseInt(timeElement.textContent.trim().match(/\d+/)?.[0] || "30") 
            : 30;
            
          const servings = servingsElement 
            ? parseInt(servingsElement.textContent.trim().match(/\d+/)?.[0] || "4") 
            : 4;
            
          const ingredients = Array.from(ingredientElements).map(el => 
            el.textContent.trim()
          );
          
          const instructions = Array.from(instructionElements).map(el => 
            el.textContent.trim()
          );
          
          const descriptionElement = recipeDoc.querySelector(".recipe-description");
          const description = descriptionElement 
            ? descriptionElement.textContent.trim() 
            : "";
            
          // Determine difficulty based on time and ingredients
          let difficulty = "Medel";
          if (timeMinutes < 30) {
            difficulty = "Lätt";
          } else if (timeMinutes > 60 || ingredients.length > 12) {
            difficulty = "Avancerad";
          }
          
          // Create price data (simulated)
          const basePrice = Math.floor(Math.random() * 50) + 50;
          const originalPrice = Math.round(basePrice * 1.2);
          
          // Determine tags based on categories and recipe content
          const tags = [category];
          
          // Add more tags based on ingredients or title
          const lowerTitle = title.toLowerCase();
          const allContent = [lowerTitle, ...ingredients].join(" ").toLowerCase();
          
          if (allContent.includes("kyckling")) tags.push("Kyckling");
          if (allContent.includes("vegansk") || allContent.includes("vegan")) tags.push("Veganskt");
          if (allContent.includes("vegetarisk") || category === "Vegetariskt") tags.push("Vegetariskt");
          if (timeMinutes <= 30) tags.push("Snabbt");
          if (ingredients.length <= 8) tags.push("Enkelt");
          if (allContent.includes("träning") || allContent.includes("protein")) tags.push("Träning");
          if (allContent.includes("barn") || allContent.includes("familj")) tags.push("Familjemåltider");
          if (allContent.includes("budget") || ingredients.length <= 6) tags.push("Budget");
          if (allContent.includes("matlåd")) tags.push("Matlådevänligt");
          
          // Create recipe object
          const recipe = {
            title,
            description,
            image_url: imageUrl,
            time_minutes: timeMinutes,
            servings,
            difficulty,
            ingredients,
            instructions,
            tags: [...new Set(tags)], // Remove duplicates
            source_url: fullRecipeUrl,
            category,
            price: basePrice,
            original_price: originalPrice
          };
          
          allRecipes.push(recipe);
          console.log(`Added recipe: ${title}`);
        } catch (error) {
          console.error(`Error processing recipe ${title}:`, error);
          // Continue with next recipe even if this one fails
        }
      }
    } catch (error) {
      console.error(`Error processing category ${categoryUrl}:`, error);
      // Continue with next category even if this one fails
    }
  }
  
  console.log(`Total recipes scraped: ${allRecipes.length}`);
  return allRecipes;
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
    const { error: deleteError } = await supabase
      .from('recipes')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000');
      
    if (deleteError) {
      console.error("Error clearing existing recipes:", deleteError);
      throw deleteError;
    }
    
    // Insert new recipes one by one to avoid timeouts
    let successCount = 0;
    
    for (const recipe of recipes) {
      const { error: insertError } = await supabase
        .from('recipes')
        .insert([recipe]);
        
      if (insertError) {
        console.error(`Error inserting recipe ${recipe.title}:`, insertError);
      } else {
        successCount++;
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
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }
  
  try {
    console.log("Starting recipe scraper function...");
    
    // Scrape recipes from godare.se
    const recipes = await scrapeRecipes();
    
    if (recipes.length === 0) {
      throw new Error("No recipes could be scraped from the website.");
    }
    
    // Store recipes in Supabase
    const insertedCount = await storeRecipes(recipes);
    
    // Return success response
    return new Response(
      JSON.stringify({
        success: true,
        message: `Successfully scraped and stored ${insertedCount} recipes from godare.se`,
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
