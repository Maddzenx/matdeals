import { supabase } from "@/integrations/supabase/client";
import { Recipe, RecipeIngredient, DatabaseRecipe, RecipeIngredients, convertDatabaseRecipeToRecipe } from "@/types/recipe";
import { Product } from "@/data/types";
import { calculateRecipeSavings } from "@/utils/ingredientsMatchUtils";
import { getApiKey } from "@/utils/env";

interface GeneratedRecipe {
  title: string;
  description: string;
  ingredients: RecipeIngredient[];
  instructions: string[];
  category: string;
  time_minutes?: number;
  servings?: number;
  difficulty?: string;
  store?: string;
}

interface DatabaseRecipeWithTitle {
  id: string;
  title: string;
}

interface Ingredient {
  name: string;
  amount: number | string;
  unit: string;
}

// Type guard function
function isRecipeIngredients(obj: any): obj is RecipeIngredients {
  return obj && typeof obj === 'object' && 'main' in obj;
}

// Helper function to convert ingredients to RecipeIngredient[]
function convertIngredients(ingredients: RecipeIngredient[] | RecipeIngredients): RecipeIngredient[] {
  if (Array.isArray(ingredients)) {
    return ingredients.map(ing => {
      if (typeof ing === 'string') {
        return { name: ing, amount: 1, unit: 'st' };
      }
      if (typeof ing === 'object' && ing !== null && ing.name) {
        return {
          name: String(ing.name),
          amount: typeof ing.amount === 'string' ? parseFloat(ing.amount) : (ing.amount || 1),
          unit: String(ing.unit || 'st')
        };
      }
      return { name: '', amount: 1, unit: 'st' };
    });
  }

  // Handle RecipeIngredients type
  const mainIngredients = Array.isArray(ingredients.main) ? ingredients.main : [];
  const sauceIngredients = Array.isArray(ingredients.sauce) ? ingredients.sauce : [];
  const garnishIngredients = Array.isArray(ingredients.garnish) ? ingredients.garnish : [];
  
  return [
    ...mainIngredients,
    ...sauceIngredients,
    ...garnishIngredients
  ];
}

const cleanupDuplicateRecipes = async () => {
  console.log('Cleaning up duplicate recipes...');
  try {
    // Get all recipes
    const { data: allRecipes, error: fetchError } = await supabase
      .from('recipes')
      .select('id, title');

    if (fetchError) {
      console.error("Error fetching recipes for cleanup:", fetchError);
      return;
    }

    // Group recipes by title (case-insensitive)
    const recipesByTitle = new Map<string, string[]>();
    allRecipes?.forEach((recipe: DatabaseRecipeWithTitle) => {
      const normalizedTitle = recipe.title.toLowerCase();
      if (!recipesByTitle.has(normalizedTitle)) {
        recipesByTitle.set(normalizedTitle, []);
      }
      recipesByTitle.get(normalizedTitle)?.push(recipe.id);
    });

    // Delete all but the first recipe for each title
    for (const [title, ids] of recipesByTitle.entries()) {
      if (ids.length > 1) {
        console.log(`Found ${ids.length} duplicates for title: ${title}`);
        // Keep the first ID and delete the rest
        const idsToDelete = ids.slice(1);
        const { error: deleteError } = await supabase
          .from('recipes')
          .delete()
          .in('id', idsToDelete);

        if (deleteError) {
          console.error(`Error deleting duplicates for ${title}:`, deleteError);
        } else {
          console.log(`Deleted ${idsToDelete.length} duplicates for ${title}`);
        }
      }
    }
  } catch (err) {
    console.error('Error cleaning up duplicate recipes:', err);
  }
};

export const fetchRecipesByCategory = async (
  category?: string,
  products: Product[] = []
): Promise<Recipe[]> => {
  try {
    console.log(`Fetching recipes${category ? ` for category: ${category}` : ''}`);
    
    // First, check if we can connect to Supabase
    try {
      const { error: healthCheck } = await supabase.from('recipes').select('count');
      if (healthCheck) {
        console.error("Supabase connection error:", healthCheck);
        throw new Error('Could not connect to database');
      }
    } catch (err) {
      console.error("Database health check failed:", err);
      throw new Error('Database connection failed');
    }
    
    // Build the query
    let query = supabase
      .from('recipes')
      .select('*');
      
    if (category && category !== 'Alla') {
      query = query.eq('category', category);
    }
    
    console.log('Executing query:', query);
    const { data, error: queryError } = await query;
    
    if (queryError) {
      console.error("Supabase query error:", queryError);
      throw queryError;
    }
    
    console.log(`Fetched ${data?.length || 0} recipes from database`);
    
    if (!data || data.length === 0) {
      console.log('No recipes found in database, attempting to generate new ones');
      // Try to generate new recipes if none found
      const generatedRecipes = await generateRecipesFromDiscountedProducts(products);
     
      if (generatedRecipes.length > 0) {
        const { success, error } = await insertGeneratedRecipes(generatedRecipes);
        if (success) {
          return generatedRecipes;
        } else {
          console.error("Failed to insert generated recipes:", error);
          return [];
        }
      }
      return [];
    }

    // Convert database recipes to frontend Recipe type and add calculated prices
    const processedRecipes = data.map((dbRecipe: DatabaseRecipe) => {
      try {
        if (!dbRecipe) {
          console.error('Received null or undefined recipe from database');
          return null;
        }

        console.log('Processing recipe:', dbRecipe.id, dbRecipe.title);
        
        // First convert the database recipe to our frontend Recipe type
        const recipe = convertDatabaseRecipeToRecipe(dbRecipe);
        
        // Ensure ingredients is an array of objects with name property
        let validIngredients: RecipeIngredient[] = [];
        
        if (Array.isArray(recipe.ingredients)) {
          validIngredients = (recipe.ingredients as RecipeIngredient[]).map((ing: RecipeIngredient) => {
            if (typeof ing === 'string') {
              return { name: ing, amount: 1, unit: 'st' } as RecipeIngredient;
            }
            if (typeof ing === 'object' && ing !== null && ing.name) {
              return {
                name: String(ing.name),
                amount: typeof ing.amount === 'string' ? parseFloat(ing.amount) : (ing.amount || 1),
                unit: String(ing.unit || 'st')
              } as RecipeIngredient;
            }
            return null;
          }).filter((ing): ing is RecipeIngredient => ing !== null);
        } else if (isRecipeIngredients(recipe.ingredients)) {
          const mainIngredients = Array.isArray(recipe.ingredients.main) ? recipe.ingredients.main : [];
          const sauceIngredients = Array.isArray(recipe.ingredients.sauce) ? recipe.ingredients.sauce : [];
          const garnishIngredients = Array.isArray(recipe.ingredients.garnish) ? recipe.ingredients.garnish : [];
          
          validIngredients = [
            ...mainIngredients,
            ...sauceIngredients,
            ...garnishIngredients
          ];
        }
        
        recipe.ingredients = validIngredients;
        
        // Calculate price info based on matching ingredients with products
        const { discountedPrice, originalPrice, savings, matchedProducts } = 
          calculateRecipeSavings(recipe.ingredients, products);
          
        return {
          ...recipe,
          calculatedPrice: discountedPrice || recipe.price,
          calculatedOriginalPrice: originalPrice || recipe.original_price,
          savings,
          matchedProducts
        };
      } catch (err) {
        console.error('Error processing recipe:', err);
        return null;
      }
    }).filter((recipe: Recipe | null): recipe is Recipe => recipe !== null);

    return processedRecipes;
  } catch (err) {
    console.error('Error fetching recipes:', err);
    throw err;
  }
};

// Update the return type to include the recipe property
export const scrapeRecipesFromApi = async (
  showNotification = true,
  recipeId?: string
): Promise<{ success: boolean; count?: number; error?: string; recipe?: any }> => {
  try {
    console.log(recipeId 
      ? `Invoking scrape-recipes edge function for recipe: ${recipeId}` 
      : "Invoking scrape-recipes edge function for all recipes..."
    );
    
    // Call the Supabase Edge Function
    const { data, error: functionError } = await supabase.functions.invoke("scrape-recipes", {
      method: 'POST',
      body: recipeId ? { recipeId } : {} // Pass recipe ID if specified
    });
    
    console.log("Edge function response:", data);
    
    if (functionError) {
      console.error("Edge function error:", functionError);
      throw new Error(functionError.message || 'Failed to scrape recipes');
    }
    
    if (!data || !data.success) {
      const errorMsg = data?.error || 'Unknown error occurred';
      console.error("Edge function failed:", errorMsg);
      throw new Error(errorMsg);
    }
    
    return { 
      success: true, 
      count: data.recipesCount,
      recipe: data.recipe
    };
  } catch (err) {
    console.error('Error scraping recipes:', err);
    
    return { 
      success: false, 
      error: err instanceof Error ? err.message : 'Unknown error' 
    };
  }
};

export const insertGeneratedRecipes = async (recipes: Recipe[]): Promise<{ success: boolean; error?: string }> => {
  console.log('Starting to insert generated recipes...');
  try {
    // First, get all existing recipes
    const { data: existingRecipes, error: fetchError } = await supabase
      .from('recipes')
      .select('id, title')
      .order('created_at', { ascending: false });

    if (fetchError) {
      console.error("Error checking for existing recipes:", fetchError);
      return { success: false, error: fetchError.message };
    }

    console.log('Found existing recipes:', existingRecipes?.length || 0);

    // Create a map of existing titles (case-insensitive)
    const existingTitles = new Map<string, string>();
    existingRecipes?.forEach((recipe: DatabaseRecipeWithTitle) => {
      const normalizedTitle = recipe.title.toLowerCase();
      if (!existingTitles.has(normalizedTitle)) {
        existingTitles.set(normalizedTitle, recipe.id);
      }
    });

    // Filter out recipes that already exist
    const newRecipes = recipes.filter(recipe => {
      const normalizedTitle = recipe.title.toLowerCase();
      if (existingTitles.has(normalizedTitle)) {
        console.log(`Skipping duplicate recipe: ${recipe.title}`);
        return false;
      }
      return true;
    });

    if (newRecipes.length === 0) {
      console.log('No new recipes to insert - all recipes already exist');
      return { success: true };
    }

    console.log(`Found ${newRecipes.length} new recipes to insert`);

    // Convert recipes to database format
    const dbRecipes = newRecipes.map(recipe => {
      // Ensure we have a valid UUID
      const recipeId = recipe.id && recipe.id.match(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/) 
        ? recipe.id 
        : crypto.randomUUID();

      const dbRecipe = {
        id: recipeId,
        title: recipe.title,
        description: recipe.description,
        instructions: recipe.instructions,
        category: recipe.category,
        ingredients: convertIngredients(recipe.ingredients),
        time_minutes: recipe.time_minutes,
        servings: recipe.servings,
        difficulty: recipe.difficulty,
        store: recipe.store || 'ICA', // Default to ICA if no store is specified
        created_at: recipe.created_at || new Date().toISOString()
      };

      console.log('Converting recipe to database format:', dbRecipe);
      return dbRecipe;
    });

    console.log('Inserting new recipes into database:', dbRecipes.map(r => r.title));

    // Insert recipes one at a time to handle potential duplicates
    for (const recipe of dbRecipes) {
      console.log(`Inserting recipe: ${recipe.title}`);
      const { error } = await supabase
        .from('recipes')
        .insert(recipe)
        .select();

      if (error) {
        if (error.code === '23505') {
          console.log(`Recipe already exists: ${recipe.title}`);
          continue;
        }
        console.error("Error inserting recipe:", error);
        return { success: false, error: error.message };
      }
      console.log(`Successfully inserted recipe: ${recipe.title}`);
    }

    console.log(`Successfully processed ${dbRecipes.length} recipes`);
    return { success: true };
  } catch (err) {
    console.error('Error inserting recipes:', err);
    return { 
      success: false, 
      error: err instanceof Error ? err.message : 'Unknown error' 
    };
  }
};

export const generateRecipesFromDiscountedProducts = async (products: Product[]): Promise<Recipe[]> => {
  console.log('Starting recipe generation for products:', products);
  const apiKey = getApiKey();

  if (!apiKey) {
    console.error('No API key found for recipe generation');
    return [];
  }

  try {
    // Group products by category
    const productsByCategory = products.reduce((acc, product) => {
      if (!acc[product.category]) {
        acc[product.category] = [];
      }
      acc[product.category].push(product);
      return acc;
    }, {} as Record<string, Product[]>);

    const generatedRecipes: Recipe[] = [];

    // Generate recipes for each category
    for (const [category, categoryProducts] of Object.entries(productsByCategory)) {
      if (categoryProducts.length === 0) continue;

      // Take the first product from the category as the main ingredient
      const mainProduct = categoryProducts[0];
      console.log(`Generating recipe for ${mainProduct.name} in category ${category}`);

      const prompt = `Create a detailed Swedish recipe using ${mainProduct.name} as the main ingredient. 
The recipe should be authentic, practical, and include exact measurements. Follow this structure:

1. Title: A creative Swedish name that reflects the dish
2. Description: A brief overview of the dish and its flavors
3. Category: ${category}
4. Time: Total cooking time in minutes
5. Servings: Number of servings
6. Difficulty: Lätt/Medel/Avancerad
7. Ingredients: List with exact measurements in Swedish units (dl, msk, tsk, g, kg)
8. Instructions: Create detailed, step-by-step instructions with clear explanations for each step:

   Preparation Steps:
   - List all preparation tasks (e.g., preheating oven, chopping ingredients)
   - Explain why each preparation step is important
   - Include any special equipment needed
   - Note any time-sensitive preparations

   Cooking Steps:
   - Break down each cooking step into clear, numbered instructions
   - Include exact temperatures and cooking times
   - Explain what to look for at each stage (e.g., "when the onions are translucent")
   - Provide visual cues for doneness
   - Include safety tips where relevant
   - Explain the purpose of each step (e.g., "browning adds flavor")

   Finishing Steps:
   - Describe how to check if the dish is properly cooked
   - Explain how to adjust seasoning if needed
   - Provide plating suggestions
   - Include garnishing tips

   Serving and Storage:
   - Suggest appropriate side dishes
   - Explain how to store leftovers
   - Provide reheating instructions
   - Note any make-ahead tips

Format the response as a JSON object with this structure:
{
  "title": "Recipe title in Swedish",
  "description": "Brief description in Swedish",
  "category": "${category}",
  "time_minutes": number,
  "servings": number,
  "difficulty": "Lätt/Medel/Avancerad",
  "ingredients": [
    { "name": "ingredient name", "amount": number, "unit": "unit" }
  ],
  "instructions": [
    "Step 1: Detailed instruction with explanation",
    "Step 2: Detailed instruction with explanation",
    ...
  ]
}`;

      console.log('Sending request to OpenAI API...');
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: [{
            role: 'user',
            content: prompt
          }],
          response_format: { type: 'json_object' }
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('OpenAI API error:', errorText);
        throw new Error(`API request failed with status ${response.status}: ${errorText}`);
      }

      const data = await response.json();
      console.log('Received response from OpenAI API:', data);

      const recipeData = JSON.parse(data.choices[0].message.content);
      console.log('Parsed recipe data:', recipeData);

      // Convert prices to numbers
      const price = mainProduct.price ? parseFloat(String(mainProduct.price).replace(',', '.').replace(/[^\d.-]/g, '')) : null;
      const originalPrice = mainProduct.originalPrice ? parseFloat(String(mainProduct.originalPrice).replace(',', '.').replace(/[^\d.-]/g, '')) : null;
      const currentPrice = mainProduct.currentPrice ? parseFloat(String(mainProduct.currentPrice).replace(',', '.').replace(/[^\d.-]/g, '')) : null;
      const savings = originalPrice && currentPrice ? originalPrice - currentPrice : 0;

      // Convert the generated recipe to our Recipe type
      const recipe: Recipe = {
        id: crypto.randomUUID(),
        title: recipeData.title,
        description: recipeData.description,
        ingredients: recipeData.ingredients,
        instructions: recipeData.instructions,
        category: recipeData.category,
        time_minutes: recipeData.time_minutes,
        servings: recipeData.servings,
        difficulty: recipeData.difficulty,
        created_at: new Date().toISOString(),
        price,
        original_price: originalPrice,
        savings,
        store: mainProduct.store
      };

      console.log('Generated recipe:', recipe);
      generatedRecipes.push(recipe);
    }

    // Insert the generated recipes into the database
    if (generatedRecipes.length > 0) {
      console.log('Inserting generated recipes into database...');
      const { success, error } = await insertGeneratedRecipes(generatedRecipes);
      if (!success) {
        console.error('Failed to insert recipes:', error);
        throw new Error(`Failed to insert recipes: ${error}`);
      }
      console.log('Successfully inserted recipes into database');
    }

    return generatedRecipes;
  } catch (error) {
    console.error('Error in generateRecipesFromDiscountedProducts:', error);
    throw error;
  }
};
