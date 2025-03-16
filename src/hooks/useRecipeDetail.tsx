
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Recipe } from "./useRecipes";

export const useRecipeDetail = (id: string | undefined) => {
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchRecipe = async () => {
      if (!id) {
        setError(new Error("No recipe ID provided"));
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const { data, error: queryError } = await supabase
          .from('recipes')
          .select('*')
          .eq('id', id)
          .maybeSingle();

        if (queryError) {
          console.error("Error fetching recipe:", queryError);
          throw queryError;
        }

        if (data) {
          setRecipe(data as Recipe);
        } else {
          setError(new Error("Recipe not found"));
        }
      } catch (err) {
        console.error("Error fetching recipe details:", err);
        setError(err instanceof Error ? err : new Error("Unknown error occurred"));
      } finally {
        setLoading(false);
      }
    };

    fetchRecipe();
  }, [id]);

  const scrapeRecipe = async (recipeId: string) => {
    if (!recipeId) return;
    
    try {
      setLoading(true);
      
      // Call the Supabase Edge Function to re-scrape this specific recipe
      const { data, error: functionError } = await supabase.functions.invoke("scrape-recipes", {
        method: 'POST',
        body: { recipeId } // Pass the specific recipe ID
      });
      
      if (functionError) {
        throw new Error(functionError.message || 'Failed to update recipe details');
      }
      
      if (!data || !data.success) {
        throw new Error(data?.error || 'Unknown error occurred');
      }
      
      // Re-fetch the recipe to get the updated data
      const { data: updatedRecipe, error: queryError } = await supabase
        .from('recipes')
        .select('*')
        .eq('id', recipeId)
        .maybeSingle();
        
      if (queryError) {
        throw queryError;
      }
      
      if (updatedRecipe) {
        setRecipe(updatedRecipe as Recipe);
      }
    } catch (err) {
      console.error('Error updating recipe details:', err);
    } finally {
      setLoading(false);
    }
  };

  return { recipe, loading, error, scrapeRecipe };
};
