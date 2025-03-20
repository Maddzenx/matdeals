
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Recipe } from "@/types/recipe";
import { useToast } from "@/hooks/use-toast";
import { scrapeRecipesFromApi } from "@/services/recipeService";

export const useRecipeDetail = (id: string | undefined) => {
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const { toast } = useToast();

  const fetchRecipe = async (recipeId: string) => {
    try {
      setLoading(true);
      setError(null);

      console.log(`Fetching recipe with ID: ${recipeId}`);
      
      const { data, error: queryError } = await supabase
        .from('recipes')
        .select('*')
        .eq('id', recipeId)
        .maybeSingle();

      if (queryError) {
        console.error("Error fetching recipe:", queryError);
        throw queryError;
      }

      if (data) {
        console.log("Recipe data found:", data.title);
        setRecipe(data as Recipe);
        return true;
      } else {
        console.error(`Recipe with ID ${recipeId} not found in database`);
        setError(new Error(`Recipe with ID ${recipeId} not found`));
        return false;
      }
    } catch (err) {
      console.error("Error fetching recipe details:", err);
      setError(err instanceof Error ? err : new Error("Unknown error occurred"));
      return false;
    } finally {
      setLoading(false);
    }
  };

  const refreshRecipe = async () => {
    if (!id) {
      console.error("Cannot refresh recipe: No recipe ID provided");
      return false;
    }

    try {
      setRefreshing(true);
      
      console.log(`Attempting to refresh recipe with ID: ${id}`);
      
      // Call the edge function to scrape this specific recipe
      const result = await scrapeRecipesFromApi(false, id);
      
      if (!result.success) {
        console.error("Failed to refresh recipe:", result.error);
        return false;
      }
      
      if (result.recipe) {
        console.log("Successfully refreshed recipe:", result.recipe.title);
        setRecipe(result.recipe);
        setError(null);
        return true;
      }
      
      // If we got success but no recipe, try fetching again
      return await fetchRecipe(id);
      
    } catch (err) {
      console.error("Error refreshing recipe:", err);
      return false;
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (!id) {
      setError(new Error("No recipe ID provided"));
      setLoading(false);
      return;
    }

    fetchRecipe(id);
  }, [id]);

  return { 
    recipe, 
    loading, 
    error, 
    refreshing,
    refreshRecipe
  };
};
