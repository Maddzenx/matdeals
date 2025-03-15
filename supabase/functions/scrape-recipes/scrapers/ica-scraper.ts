
import { fetchAndParse } from "../utils/http-util.ts";

// Parse recipes from ICA.se
export async function scrapeRecipesFromICA(): Promise<any[]> {
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
            
            // Enhanced: Extract ingredients with quantities
            const ingredientElements = recipeDocument.querySelectorAll('.ingredients-list-group li, .ingredient-item, .ingredients li');
            const ingredients = Array.from(ingredientElements).map(el => {
              // Get the full text which should include quantity and ingredient
              const fullText = el.textContent.trim();
              return fullText; // This preserves the format: "300 g spaghetti", "1 vitlöksklyfta", etc.
            }).filter(text => text.length > 0); // Filter out empty items
            
            // Enhanced: Extract step-by-step instructions
            const instructionElements = recipeDocument.querySelectorAll('.recipe-instructions-item, .instruction-item, .instructions li, .recipe-preparation-steps li');
            const instructions = Array.from(instructionElements).map((el, index) => {
              // Get the full instruction step text
              const stepText = el.textContent.trim();
              return stepText; // This preserves the format of each step
            }).filter(text => text.length > 0); // Filter out empty steps
            
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
            console.log(`With ${ingredients.length} ingredients and ${instructions.length} instruction steps`);
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
