
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
          .single();

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

  return { recipe, loading, error };
};
