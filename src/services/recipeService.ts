import { supabase } from "@/integrations/supabase/client";
import { Recipe, convertDatabaseRecipeToRecipe } from "@/types/recipe";
import { Product } from "@/data/types";
import { calculateRecipeSavings } from "@/utils/ingredientsMatchUtils";

interface Ingredient {
  name: string;
  amount: number;
  unit: string;
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
    allRecipes?.forEach(recipe => {
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
    const processedRecipes = data.map((dbRecipe) => {
      try {
        if (!dbRecipe) {
          console.error('Received null or undefined recipe from database');
          return null;
        }

        console.log('Processing recipe:', dbRecipe.id, dbRecipe.title);
        
        // First convert the database recipe to our frontend Recipe type
        const recipe = convertDatabaseRecipeToRecipe(dbRecipe);
        
        // Ensure ingredients is an array of objects with name property
        const validIngredients = Array.isArray(recipe.ingredients) 
          ? recipe.ingredients.map((ing: any) => {
              if (typeof ing === 'string') {
                return { name: ing, amount: 1, unit: 'st' };
              }
              if (typeof ing === 'object' && ing !== null && ing.name) {
                return {
                  name: String(ing.name),
                  amount: Number(ing.amount || 1),
                  unit: String(ing.unit || 'st')
                };
              }
              return null;
            }).filter((ing): ing is Ingredient => ing !== null)
          : [];
        
        recipe.ingredients = validIngredients;
        
        // Calculate price info based on matching ingredients with products
        const { discountedPrice, originalPrice, savings, matchedProducts } = 
          calculateRecipeSavings(recipe.ingredients, products);
          
        return {
          ...recipe,
          calculatedPrice: discountedPrice || recipe.price,
          calculatedOriginalPrice: originalPrice || recipe.original_price,
          savings: savings || 0,
          matchedProducts: matchedProducts || []
        } as Recipe;
      } catch (err) {
        console.error('Error processing recipe:', dbRecipe?.id, err);
        return null;
      }
    });

    const validRecipes = processedRecipes.filter((recipe): recipe is Recipe => recipe !== null);
    console.log(`Successfully processed ${validRecipes.length} recipes`);
    
    if (validRecipes.length === 0) {
      throw new Error('No valid recipes could be processed');
    }
    
    return validRecipes;
  } catch (err) {
    console.error('Error in fetchRecipesByCategory:', err);
    throw new Error(err instanceof Error ? err.message : 'Failed to fetch recipes');
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

    // Create a map of existing titles (case-insensitive)
    const existingTitles = new Map<string, string>();
    existingRecipes?.forEach(recipe => {
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

    // Convert recipes to database format
    const dbRecipes = newRecipes.map(recipe => {
      // Ensure we have a valid UUID
      const recipeId = recipe.id && recipe.id.match(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/) 
        ? recipe.id 
        : crypto.randomUUID();

      return {
        id: recipeId,
        title: recipe.title,
        description: recipe.description,
        instructions: recipe.instructions,
        category: recipe.category,
        ingredients: recipe.ingredients.map((ing: Ingredient) => ({
          name: String(ing.name || ''),
          amount: Number(ing.amount || 1),
          unit: String(ing.unit || 'st')
        }))
      };
    });

    console.log('Inserting new recipes into database:', dbRecipes.map(r => r.title));

    // Insert recipes one at a time to handle potential duplicates
    for (const recipe of dbRecipes) {
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
  console.log('Starting recipe generation from discounted products...');
  
  // Get all existing recipes
  const { data: existingRecipes, error: fetchError } = await supabase
    .from('recipes')
    .select('title')
    .order('created_at', { ascending: false });

  if (fetchError) {
    console.error("Error checking for existing recipes:", fetchError);
    return [];
  }

  // Create a set of existing titles (case-insensitive)
  const existingTitles = new Set(existingRecipes?.map(r => r.title.toLowerCase()) || []);
  
  // Filter products to only include those with discounts
  const discountedProducts = products.filter(product => 
    product.originalPrice && product.currentPrice && product.originalPrice > product.currentPrice
  );
  
  console.log(`Found ${discountedProducts.length} discounted products to generate recipes from`);
  
  // Create a set of recipes to ensure uniqueness
  const recipeSet = new Set<string>();
  const recipes: Recipe[] = [];
  
  // Generate recipes for each discounted product
  for (const product of discountedProducts) {
    const recipeTitle = `Recept med ${product.name}`;
    const normalizedTitle = recipeTitle.toLowerCase();
    
    // Skip if recipe with this title already exists
    if (existingTitles.has(normalizedTitle) || recipeSet.has(normalizedTitle)) {
      console.log(`Skipping duplicate recipe: ${recipeTitle}`);
      continue;
    }
    
    // Add to our set to prevent duplicates in this batch
    recipeSet.add(normalizedTitle);
    
    const recipe: Recipe = {
      id: crypto.randomUUID(),
      title: recipeTitle,
      description: `Ett enkelt och smakfullt recept med ${product.name} som huvudingrediens.`,
      instructions: [
        "1. Förbered alla ingredienser",
        "2. Följ stegen i receptet",
        "3. Servera och njut!"
      ],
      category: "Rabatterade varor",
      ingredients: [
        {
          name: product.name,
          amount: 1,
          unit: "st"
        }
      ]
    };
    
    recipes.push(recipe);
  }
  
  console.log(`Generated ${recipes.length} unique recipes from discounted products`);
  return recipes;
};
