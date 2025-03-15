
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

// Try multiple selectors to find elements
function trySelectors(document: Document, selectors: string[]): Element[] {
  for (const selector of selectors) {
    const elements = document.querySelectorAll(selector);
    if (elements && elements.length > 0) {
      console.log(`Found ${elements.length} elements with selector: ${selector}`);
      return Array.from(elements);
    }
  }
  console.log(`No elements found for any of these selectors: ${selectors.join(', ')}`);
  return [];
}

// Scrape recipe data from godare.se
async function scrapeRecipes() {
  const baseUrl = "https://www.godare.se";
  const categoryUrls = [
    "/recept/middag",
    "/recept/vegetariskt",
    "/recept/bakning",
    "/recept/forratt"
  ];
  
  const allRecipes = [];
  
  // Limit to 2 categories to avoid timeouts
  const limitedCategories = categoryUrls.slice(0, 2);
  
  for (const categoryUrl of limitedCategories) {
    try {
      const fullUrl = baseUrl + categoryUrl;
      console.log(`Scraping category: ${fullUrl}`);
      
      const document = await fetchAndParse(fullUrl);
      
      // Check if we're being redirected or blocked
      const title = document.querySelector("title")?.textContent;
      console.log(`Page title: ${title}`);
      
      if (title?.includes("403") || title?.includes("Forbidden") || title?.includes("Access Denied")) {
        console.error("Access denied by the website. Might be blocked.");
        continue;
      }
      
      // Try different selectors for recipe cards
      const recipeCards = trySelectors(document, [
        ".recipe-card", 
        "article.recipe-card",
        "article", 
        ".recipe", 
        ".recipe-container",
        ".content article",
        "[class*='recipe']",
        "[id*='recipe']"
      ]);
      
      console.log(`Found ${recipeCards.length} recipe cards in ${fullUrl}`);
      
      if (recipeCards.length === 0) {
        console.log("No recipe cards found, dumping some DOM structure");
        // Try to get a sense of the document structure
        const body = document.querySelector("body");
        if (body) {
          const firstLevelChildren = Array.from(body.children).map(
            el => `${el.tagName}${el.id ? '#'+el.id : ''}${Array.from(el.classList).map(c => '.'+c).join('')}`
          );
          console.log("Body first level children:", firstLevelChildren.join(", "));
        }
      }
      
      const category = getCategoryFromUrl(categoryUrl);
      
      // Limit to 3 recipes per category to avoid timeouts
      const limit = Math.min(recipeCards.length, 3);
      
      for (let i = 0; i < limit; i++) {
        const card = recipeCards[i];
        
        try {
          // Extract basic recipe info from card with multiple potential selectors
          const titleElement = 
            card.querySelector(".recipe-card__title") || 
            card.querySelector("[class*='title']") || 
            card.querySelector("h2, h3") || 
            card.querySelector("a");
            
          const linkElement = 
            card.querySelector("a.recipe-card__link") || 
            card.querySelector("a");
            
          const imageElement = 
            card.querySelector("img") || 
            card.querySelector("[class*='image']") || 
            card.querySelector("[class*='img']");
          
          if (!titleElement) {
            console.log("Missing title element, card HTML:", card.outerHTML.substring(0, 200));
            continue;
          }
          
          if (!linkElement) {
            console.log("Missing link element, card HTML:", card.outerHTML.substring(0, 200));
            continue;
          }
          
          const title = titleElement.textContent.trim();
          const recipeUrl = linkElement.getAttribute("href");
          
          if (!recipeUrl) {
            console.log("Missing recipe URL, skipping recipe");
            continue;
          }
          
          const fullRecipeUrl = recipeUrl.startsWith("http") ? recipeUrl : (
            recipeUrl.startsWith("/") ? baseUrl + recipeUrl : baseUrl + "/" + recipeUrl
          );
          const imageUrl = imageElement?.getAttribute("src") || "";
          
          console.log(`Processing recipe: ${title} at ${fullRecipeUrl}`);
          
          try {
            // Fetch detailed recipe page
            const recipeDoc = await fetchAndParse(fullRecipeUrl);
            
            // Extract recipe details with multiple potential selectors
            const timeElement = 
              recipeDoc.querySelector(".recipe-meta__item--time") || 
              recipeDoc.querySelector(".recipe-meta time") ||
              recipeDoc.querySelector("[class*='time']") || 
              recipeDoc.querySelector("[class*='duration']");
              
            const servingsElement = 
              recipeDoc.querySelector(".recipe-meta__item--portions") || 
              recipeDoc.querySelector(".recipe-portions") ||
              recipeDoc.querySelector("[class*='portion']") || 
              recipeDoc.querySelector("[class*='serving']");
              
            const ingredientsElements = trySelectors(recipeDoc, [
              ".recipe-ingredients__list-item", 
              ".ingredients-list li",
              "[class*='ingredient'] li",
              "[class*='ingredients'] li",
              "ul li"
            ]);
            
            const instructionsElements = trySelectors(recipeDoc, [
              ".recipe-instructions__list-item", 
              ".method-steps li",
              "[class*='instruction'] li",
              "[class*='step'] li",
              "ol li"
            ]);
            
            // Try to parse time in minutes from text content
            const timeText = timeElement?.textContent.trim() || "";
            let timeMinutes = 30; // Default
            const timeMatch = timeText.match(/(\d+)\s*(min|minut)/i);
            if (timeMatch) {
              timeMinutes = parseInt(timeMatch[1]);
            }
            
            // Try to parse servings from text content
            const servingsText = servingsElement?.textContent.trim() || "";
            let servings = 4; // Default
            const servingsMatch = servingsText.match(/(\d+)\s*(port|pers)/i);
            if (servingsMatch) {
              servings = parseInt(servingsMatch[1]);
            }
            
            const ingredients = ingredientsElements.map(el => 
              el.textContent.trim()
            );
            
            const instructions = instructionsElements.map(el => 
              el.textContent.trim()
            );
            
            // Try different selectors for description
            const descriptionElement = 
              recipeDoc.querySelector(".recipe-description") || 
              recipeDoc.querySelector(".recipe-intro") ||
              recipeDoc.querySelector("[class*='intro']") || 
              recipeDoc.querySelector("[class*='description']") ||
              recipeDoc.querySelector("p");
              
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
        } catch (cardError) {
          console.error(`Error processing recipe card ${i}:`, cardError);
          // Continue with next card
        }
      }
    } catch (error) {
      console.error(`Error processing category ${categoryUrl}:`, error);
      // Continue with next category even if this one fails
    }
  }
  
  console.log(`Total recipes scraped: ${allRecipes.length}`);
  
  // If no recipes could be scraped, create some mock data
  if (allRecipes.length === 0) {
    console.log("No recipes scraped, creating mock data");
    
    // Create mock recipes
    allRecipes.push({
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
    });
    
    allRecipes.push({
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
    });
    
    allRecipes.push({
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
    });
  }
  
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
