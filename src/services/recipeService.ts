
import { supabase } from "@/integrations/supabase/client";
import { Recipe } from "@/types/recipe";
import { Product } from "@/data/types";
import { calculateRecipeSavings } from "@/utils/ingredientsMatchUtils";

export const fetchRecipesByCategory = async (
  category?: string,
  products: Product[] = []
): Promise<Recipe[]> => {
  try {
    console.log(`Fetching recipes${category ? ` for category: ${category}` : ''}`);
    
    let query = supabase
      .from('recipes')
      .select('*');
      
    if (category) {
      query = query.or(`category.eq.${category},tags.cs.{"${category}"}`);
    }
    
    const { data, error: queryError } = await query;
    
    if (queryError) {
      console.error("Supabase query error:", queryError);
      throw queryError;
    }
    
    console.log(`Fetched ${data?.length || 0} recipes`);
    
    if (data) {
      // Add calculated prices based on matching ingredients with products
      return data.map((recipe: Recipe) => {
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
      });
    }
    
    return [];
  } catch (err) {
    console.error('Error fetching recipes:', err);
    throw err;
  }
};

export const scrapeRecipesFromApi = async (
  showNotification = true
): Promise<{ success: boolean; count?: number; error?: string }> => {
  try {
    console.log("Invoking scrape-recipes edge function...");
    
    // Call the Supabase Edge Function with empty body
    const { data, error: functionError } = await supabase.functions.invoke("scrape-recipes", {
      method: 'POST',
      body: {} // Required for POST
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
    
    return { success: true, count: data.recipesCount };
  } catch (err) {
    console.error('Error scraping recipes:', err);
    
    return { 
      success: false, 
      error: err instanceof Error ? err.message : 'Unknown error' 
    };
  }
};
