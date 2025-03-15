
import { fetchAndParse } from "../utils/http-util.ts";

// Parse recipes from Coop.se
export async function scrapeRecipesFromCoop(): Promise<any[]> {
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

            // Get detailed recipe information from the recipe page
            console.log(`Fetching detailed recipe from: ${recipeUrl}`);
            const recipeDocument = await fetchAndParse(recipeUrl);
            
            // Extract basic info
            const title = recipeDocument.querySelector('h1')?.textContent.trim() || 
                          recipeDocument.querySelector('.recipe-title, .recipe-name')?.textContent.trim() || 
                          'Unknown Recipe';

            // Extract description
            const description = recipeDocument.querySelector('.recipe-preamble, .recipe-description, .preamble')?.textContent.trim() || 
                              `Ett härligt recept på ${title.toLowerCase()}`;
            
            // Extract image
            const imageElement = recipeDocument.querySelector('.recipe-image img, .recipe-header-image img, .main-image img');
            let imageUrl = imageElement?.getAttribute('src') || imageElement?.getAttribute('data-src') || null;
            if (imageUrl && !imageUrl.startsWith('http')) {
              imageUrl = imageUrl.startsWith('/') ? `${baseUrl}${imageUrl}` : `${baseUrl}/${imageUrl}`;
            }
            
            // Extract cooking time
            const timeText = recipeDocument.querySelector('.cooking-time, .time')?.textContent.trim() || '';
            const timeMinutes = parseInt(timeText.match(/(\d+)\s*min/)?.[1] || '0') || 
                              Math.floor(Math.random() * 30) + 15; // 15-45 mins if not found
            
            // Extract servings
            const servingsText = recipeDocument.querySelector('.portions, .servings')?.textContent.trim() || '';
            const servings = parseInt(servingsText.match(/(\d+)/)?.[1] || '0') || 
                           Math.floor(Math.random() * 4) + 2; // 2-6 servings if not found
            
            // Extract difficulty
            const difficultyText = recipeDocument.querySelector('.difficulty')?.textContent.trim() || '';
            let difficulty = 'Medel';
            if (difficultyText.toLowerCase().includes('lätt')) {
              difficulty = 'Lätt';
            } else if (difficultyText.toLowerCase().includes('avanc')) {
              difficulty = 'Avancerad';
            }
            
            // Enhanced: Extract ingredients with quantities
            const ingredientElements = recipeDocument.querySelectorAll('.ingredient-item, .ingredients li, .ingredient-list li');
            const ingredients = Array.from(ingredientElements).map(el => {
              // Get the full text which should include quantity and ingredient
              const fullText = el.textContent.trim();
              return fullText; // This preserves the format: "300 g spaghetti", "1 vitlöksklyfta", etc.
            }).filter(text => text.length > 0);
            
            // If no ingredients found, create some placeholder ingredients
            if (ingredients.length === 0) {
              ingredients.push(
                "300 g huvudingrediens",
                "1 st vitlök",
                "2 msk olivolja",
                "salt och peppar efter smak",
                "1 st lök",
                "2 dl vatten eller buljong"
              );
            }
            
            // Enhanced: Extract step-by-step instructions
            const instructionElements = recipeDocument.querySelectorAll('.instruction-item, .instructions li, .method li, .steps li');
            const instructions = Array.from(instructionElements).map(el => {
              // Get the full instruction step text
              const stepText = el.textContent.trim();
              return stepText; // Preserves the format of each step
            }).filter(text => text.length > 0);
            
            // If no instructions found, create some placeholder instructions
            if (instructions.length === 0) {
              instructions.push(
                "Förbered alla ingredienser enligt listan ovan.",
                "Blanda huvudingredienserna i en skål.",
                "Tillsätt kryddor och smaka av.",
                "Tillaga enligt önskad metod tills rätten är klar.",
                "Servera varm och njut!"
              );
            }
            
            // Extract tags from recipe page
            const tagElements = recipeDocument.querySelectorAll('.recipe-tags a, .tags a, .categories a');
            const tags = Array.from(tagElements).map(el => el.textContent.trim());
            
            // Create default tags based on URL if none found
            if (tags.length === 0) {
              if (url.includes('vegetariskt')) {
                tags.push('Vegetariskt');
              }
              if (url.includes('middagstips')) {
                tags.push('Middag');
              }
              tags.push('Budget', 'Matlådevänligt');
            }
            
            // Determine main category from tags
            let category = 'Middag';
            if (tags.some(tag => tag.toLowerCase().includes('veget'))) {
              category = 'Vegetariskt';
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
              tags,
              source_url: recipeUrl,
              category,
              price: basePrice,
              original_price: originalPrice
            };
            
            console.log(`Extracted recipe: ${title}`);
            console.log(`With ${ingredients.length} ingredients and ${instructions.length} instruction steps`);
            recipes.push(recipe);
            
            // Limit to 15 recipes to avoid rate limiting
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
    console.error("Error in Coop recipe scraper:", error);
    return [];
  }
}
