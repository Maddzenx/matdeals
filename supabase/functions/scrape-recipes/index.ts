
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

// Parse recipes from ICA.se
async function scrapeRecipesFromICA(): Promise<any[]> {
  try {
    const baseUrl = "https://www.ica.se/recept/";
    const urls = [
      "https://www.ica.se/recept/middagstips/",
      "https://www.ica.se/recept/vegetariskt/",
      "https://www.ica.se/recept/sallader/"
    ];
    
    const recipes: any[] = [];
    const processedUrls = new Set<string>();
    
    for (const url of urls) {
      try {
        console.log(`Scraping recipes from: ${url}`);
        const document = await fetchAndParse(url);
        
        // Find recipe cards
        const recipeCards = document.querySelectorAll('.recipe-card, .recipe-teaser, .recipe-list-item');
        console.log(`Found ${recipeCards.length} recipe cards on ${url}`);
        
        for (const card of recipeCards) {
          try {
            // Get recipe URL
            const linkElement = card.querySelector('a[href*="/recept/"]');
            if (!linkElement) continue;
            
            let recipeUrl = linkElement.getAttribute('href') || '';
            if (!recipeUrl.startsWith('http')) {
              recipeUrl = recipeUrl.startsWith('/') ? `https://www.ica.se${recipeUrl}` : `https://www.ica.se/${recipeUrl}`;
            }
            
            // Skip if already processed
            if (processedUrls.has(recipeUrl)) continue;
            processedUrls.add(recipeUrl);
            
            console.log(`Fetching recipe details from: ${recipeUrl}`);
            const recipeDocument = await fetchAndParse(recipeUrl);
            
            // Extract title
            const title = recipeDocument.querySelector('h1')?.textContent.trim() || 
                          recipeDocument.querySelector('.recipe-title')?.textContent.trim() ||
                          'Unknown Recipe';
            
            // Extract description
            const description = recipeDocument.querySelector('.recipe-preamble')?.textContent.trim() || 
                               recipeDocument.querySelector('.recipe-description')?.textContent.trim() || 
                               null;
            
            // Extract image URL
            const imageElement = recipeDocument.querySelector('.recipe-image img, .recipe-header-image img');
            let imageUrl = imageElement?.getAttribute('src') || imageElement?.getAttribute('data-src') || null;
            if (imageUrl && !imageUrl.startsWith('http')) {
              imageUrl = imageUrl.startsWith('/') ? `https://www.ica.se${imageUrl}` : `https://www.ica.se/${imageUrl}`;
            }
            
            // Extract cooking time
            const timeText = recipeDocument.querySelector('.recipe-metadata-cooking-time')?.textContent.trim() || 
                           recipeDocument.querySelector('.cooking-time')?.textContent.trim() || '';
            const timeMinutes = parseInt(timeText.match(/(\d+)\s*min/)?.[1] || '0') || 30;
            
            // Extract servings
            const servingsText = recipeDocument.querySelector('.recipe-portions')?.textContent.trim() || 
                               recipeDocument.querySelector('.portions')?.textContent.trim() || '';
            const servings = parseInt(servingsText.match(/(\d+)/)?.[1] || '4') || 4;
            
            // Extract difficulty
            const difficultyText = recipeDocument.querySelector('.recipe-difficulty')?.textContent.trim() || 'Medel';
            let difficulty = 'Medel';
            if (difficultyText.toLowerCase().includes('lätt')) {
              difficulty = 'Lätt';
            } else if (difficultyText.toLowerCase().includes('avanc')) {
              difficulty = 'Avancerad';
            }
            
            // Extract ingredients
            const ingredientElements = recipeDocument.querySelectorAll('.ingredients-list-group li, .ingredient-item');
            const ingredients = Array.from(ingredientElements).map(el => el.textContent.trim());
            
            // Extract instructions
            const instructionElements = recipeDocument.querySelectorAll('.recipe-instructions-item, .instruction-item');
            const instructions = Array.from(instructionElements).map(el => el.textContent.trim());
            
            // Extract categories/tags
            const categoryElements = recipeDocument.querySelectorAll('.recipe-tags a, .recipe-categories a');
            const tags = Array.from(categoryElements).map(el => el.textContent.trim());
            
            // Determine main category from tags
            let category = 'Middag';
            if (tags.some(tag => tag.toLowerCase().includes('veget'))) {
              category = 'Vegetariskt';
            } else if (tags.some(tag => tag.toLowerCase().includes('vegan'))) {
              category = 'Veganskt';
            } else if (tags.some(tag => tag.toLowerCase().includes('fisk') || tag.toLowerCase().includes('skaldjur'))) {
              category = 'Fisk & skaldjur';
            } else if (tags.some(tag => tag.toLowerCase().includes('kyckling'))) {
              category = 'Kyckling';
            }
            
            // Calculate random price
            const basePrice = Math.floor(Math.random() * 50) + 50; // 50-100 SEK
            const originalPrice = basePrice + Math.floor(Math.random() * 30); // Original price higher
            
            const recipe = {
              id: crypto.randomUUID(),
              title,
              description,
              image_url: imageUrl,
              time_minutes: timeMinutes,
              servings,
              difficulty,
              ingredients,
              instructions,
              tags: [...tags, 'Budget', 'Matlådevänligt'], // Add common tags
              source_url: recipeUrl,
              category,
              price: basePrice,
              original_price: originalPrice
            };
            
            console.log(`Extracted recipe: ${title}`);
            recipes.push(recipe);
            
            // Limit to 15 recipes per source to avoid rate limiting
            if (recipes.length >= 15) break;
            
            // Small delay between requests to avoid rate limiting
            await new Promise(r => setTimeout(r, 1000));
            
          } catch (cardError) {
            console.error(`Error processing recipe card:`, cardError);
            continue;
          }
        }
        
        // If we have enough recipes, stop scraping
        if (recipes.length >= 15) break;
        
      } catch (urlError) {
        console.error(`Error scraping from ${url}:`, urlError);
        continue;
      }
    }
    
    return recipes;
  } catch (error) {
    console.error("Error in ICA recipe scraper:", error);
    return [];
  }
}

// Parse recipes from Coop.se
async function scrapeRecipesFromCoop(): Promise<any[]> {
  try {
    const baseUrl = "https://www.coop.se";
    const urls = [
      "https://www.coop.se/recept/middagstips/",
      "https://www.coop.se/recept/vegetariskt/"
    ];
    
    const recipes: any[] = [];
    const processedUrls = new Set<string>();
    
    for (const url of urls) {
      try {
        console.log(`Scraping recipes from: ${url}`);
        const document = await fetchAndParse(url);
        
        // Find recipe cards
        const recipeCards = document.querySelectorAll('.recipe-card, .recipe-item');
        console.log(`Found ${recipeCards.length} recipe cards on ${url}`);
        
        for (const card of recipeCards) {
          try {
            // Get recipe URL
            const linkElement = card.querySelector('a[href*="/recept/"]');
            if (!linkElement) continue;
            
            let recipeUrl = linkElement.getAttribute('href') || '';
            if (!recipeUrl.startsWith('http')) {
              recipeUrl = recipeUrl.startsWith('/') ? `${baseUrl}${recipeUrl}` : `${baseUrl}/${recipeUrl}`;
            }
            
            // Skip if already processed
            if (processedUrls.has(recipeUrl)) continue;
            processedUrls.add(recipeUrl);
            
            // Extract basic info from card
            const title = card.querySelector('.recipe-title, .recipe-name')?.textContent.trim() || 'Unknown Recipe';
            const imageElement = card.querySelector('img');
            let imageUrl = imageElement?.getAttribute('src') || imageElement?.getAttribute('data-src') || null;
            if (imageUrl && !imageUrl.startsWith('http')) {
              imageUrl = imageUrl.startsWith('/') ? `${baseUrl}${imageUrl}` : `${baseUrl}/${imageUrl}`;
            }
            
            // Generate mock data for fields we can't easily extract
            const timeMinutes = Math.floor(Math.random() * 30) + 15; // 15-45 mins
            const servings = Math.floor(Math.random() * 4) + 2; // 2-6 servings
            const difficulty = ['Lätt', 'Medel', 'Avancerad'][Math.floor(Math.random() * 3)];
            
            // Calculate random price
            const basePrice = Math.floor(Math.random() * 50) + 50; // 50-100 SEK
            const originalPrice = basePrice + Math.floor(Math.random() * 30); // Original price higher
            
            // Create tags based on URL
            const tags = [];
            if (url.includes('vegetariskt')) {
              tags.push('Vegetariskt');
            }
            if (url.includes('middagstips')) {
              tags.push('Middag');
            }
            tags.push('Budget', 'Matlådevänligt');
            
            // Determine main category from tags
            let category = 'Middag';
            if (tags.includes('Vegetariskt')) {
              category = 'Vegetariskt';
            }
            
            const recipe = {
              id: crypto.randomUUID(),
              title,
              description: `Ett härligt recept på ${title.toLowerCase()}`,
              image_url: imageUrl,
              time_minutes: timeMinutes,
              servings,
              difficulty,
              ingredients: ['Ingredienser visas i receptet'],
              instructions: ['Instruktioner visas i receptet'],
              tags,
              source_url: recipeUrl,
              category,
              price: basePrice,
              original_price: originalPrice
            };
            
            console.log(`Extracted recipe: ${title}`);
            recipes.push(recipe);
            
            // Limit to 15 recipes to avoid rate limiting
            if (recipes.length >= 15) break;
            
          } catch (cardError) {
            console.error(`Error processing recipe card:`, cardError);
            continue;
          }
        }
        
        // If we have enough recipes, stop scraping
        if (recipes.length >= 15) break;
        
      } catch (urlError) {
        console.error(`Error scraping from ${url}:`, urlError);
        continue;
      }
    }
    
    return recipes;
  } catch (error) {
    console.error("Error in Coop recipe scraper:", error);
    return [];
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
    },
    {
      id: crypto.randomUUID(),
      title: "Lax med rostad potatis",
      description: "Saftig ugnsbakad lax med krispig rostad potatis och citronaioli.",
      image_url: "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80",
      time_minutes: 40,
      servings: 4,
      difficulty: "Lätt",
      ingredients: ["Laxfilé", "Potatis", "Citron", "Dill", "Vitlök", "Olivolja"],
      instructions: ["Förbered potatis och krydda", "Rosta potatis i ugn", "Tillaga laxen", "Servera med citronaioli"],
      tags: ["Fisk", "Hälsosamt", "Snabbt"],
      source_url: "https://www.godare.se/recept/lax-med-rostad-potatis",
      category: "Fisk & skaldjur",
      price: 85,
      original_price: 98
    },
    {
      id: crypto.randomUUID(),
      title: "Pasta Carbonara",
      description: "Krämig pasta carbonara med ost, ägg och bacon. En klassisk italiensk favorit.",
      image_url: "https://images.unsplash.com/photo-1588013273468-315fd88ea34c?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80",
      time_minutes: 25,
      servings: 4,
      difficulty: "Lätt",
      ingredients: ["Pasta", "Bacon", "Parmesan", "Ägg", "Vitlök", "Svartpeppar"],
      instructions: ["Koka pastan", "Stek bacon", "Vispa ihop ägg och ost", "Blanda allt"],
      tags: ["Snabbt", "Budget", "Pasta"],
      source_url: "https://www.godare.se/recept/pasta-carbonara",
      category: "Middag",
      price: 55,
      original_price: 65
    },
    {
      id: crypto.randomUUID(),
      title: "Vegansk Chili sin Carne",
      description: "Fyllig och smakrik vegansk chili med bönor, svamp och grönsaker.",
      image_url: "https://images.unsplash.com/photo-1506102383123-c8ef1e872756?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80",
      time_minutes: 35,
      servings: 6,
      difficulty: "Lätt",
      ingredients: ["Svarta bönor", "Kidneybönor", "Svamp", "Paprika", "Lök", "Tomater", "Kryddor"],
      instructions: ["Stek grönsaker", "Tillsätt kryddor", "Tillsätt bönor och tomater", "Låt sjuda"],
      tags: ["Veganskt", "Matlådevänligt", "Budget"],
      source_url: "https://www.godare.se/recept/vegansk-chili-sin-carne",
      category: "Veganskt",
      price: 60,
      original_price: 70
    },
    {
      id: crypto.randomUUID(),
      title: "Halloumisallad med quinoa",
      description: "Fräsch sallad med stekt halloumi, quinoa, avokado och rostade nötter.",
      image_url: "https://images.unsplash.com/photo-1505253716362-afaea1d3d1af?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80",
      time_minutes: 30,
      servings: 2,
      difficulty: "Lätt",
      ingredients: ["Halloumi", "Quinoa", "Avokado", "Rödlök", "Gurka", "Tomat", "Valnötter"],
      instructions: ["Koka quinoa", "Stek halloumi", "Blanda alla ingredienser", "Toppa med dressing"],
      tags: ["Vegetariskt", "Sallad", "Hälsosamt"],
      source_url: "https://www.godare.se/recept/halloumisallad-med-quinoa",
      category: "Vegetariskt",
      price: 75,
      original_price: 85
    },
    {
      id: crypto.randomUUID(),
      title: "Ugnsbakad kyckling med rotfrukter",
      description: "Saftig ugnsbakad kyckling med härliga rotfrukter och örtkryddor.",
      image_url: "https://images.unsplash.com/photo-1518492104633-130d0cc84637?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80",
      time_minutes: 65,
      servings: 4,
      difficulty: "Medel",
      ingredients: ["Kycklinglår", "Morot", "Palsternacka", "Potatis", "Rosmarin", "Timjan", "Vitlök"],
      instructions: ["Förbered kycklingen och rotfrukterna", "Krydda generöst", "Ugnsbaka tills gyllene"],
      tags: ["Kyckling", "Matlådevänligt", "Helgmat"],
      source_url: "https://www.godare.se/recept/ugnsbakad-kyckling-med-rotfrukter",
      category: "Kyckling",
      price: 80,
      original_price: 95
    },
    {
      id: crypto.randomUUID(),
      title: "Pannkakor med bär",
      description: "Fluffiga pannkakor serverade med färska bär och lönnsirap.",
      image_url: "https://images.unsplash.com/photo-1528207776546-365bb710ee93?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80",
      time_minutes: 20,
      servings: 4,
      difficulty: "Lätt",
      ingredients: ["Vetemjöl", "Ägg", "Mjölk", "Smör", "Jordgubbar", "Blåbär", "Lönnsirap"],
      instructions: ["Vispa smeten", "Stek pannkakor", "Servera med bär och sirap"],
      tags: ["Efterrätt", "Snabbt", "Vegetariskt"],
      source_url: "https://www.godare.se/recept/pannkakor-med-bar",
      category: "Efterrätt",
      price: 45,
      original_price: 55
    },
    {
      id: crypto.randomUUID(),
      title: "Morotsoppa med ingefära",
      description: "Len och värmande morotsoppa med en kick av ingefära.",
      image_url: "https://images.unsplash.com/photo-1503146234398-4b5beba2fb22?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80",
      time_minutes: 30,
      servings: 4,
      difficulty: "Lätt",
      ingredients: ["Morötter", "Lök", "Ingefära", "Kokosmjölk", "Buljong", "Örter"],
      instructions: ["Stek lök och ingefära", "Tillsätt morötter och buljong", "Sjud tills morötterna är mjuka", "Mixa slät"],
      tags: ["Soppa", "Vegetariskt", "Hälsosamt"],
      source_url: "https://www.godare.se/recept/morotsoppa-med-ingefara",
      category: "Vegetariskt",
      price: 50,
      original_price: 60
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
    const batchSize = 5; // Process in batches of 5
    
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
      if (recipes.length < 10) {
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
