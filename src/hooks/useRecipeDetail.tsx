
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Recipe } from "./useRecipes";
import { useToast } from "@/hooks/use-toast";

export const useRecipeDetail = (id: string | undefined) => {
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
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

  useEffect(() => {
    if (!id) {
      setError(new Error("No recipe ID provided"));
      setLoading(false);
      return;
    }

    fetchRecipe(id);
  }, [id]);

  return { recipe, loading, error };
};
