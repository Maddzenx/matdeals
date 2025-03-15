
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
