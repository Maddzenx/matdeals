
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Recipe } from "./useRecipes";
import { useToast } from "@/hooks/use-toast";

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

  useEffect(() => {
    if (!id) {
      setError(new Error("No recipe ID provided"));
      setLoading(false);
      return;
    }

    fetchRecipe(id);
  }, [id]);

  const scrapeRecipe = async (recipeId: string) => {
    if (!recipeId) return;
    
    try {
      setRefreshing(true);
      toast({
        title: "Uppdaterar recept",
        description: "Hämtar den senaste informationen från källan..."
      });
      
      // Call the Supabase Edge Function to re-scrape this specific recipe
      const { data, error: functionError } = await supabase.functions.invoke("scrape-recipes", {
        method: 'POST',
        body: { recipeId } // Pass the specific recipe ID
      });
      
      if (functionError) {
        toast({
          title: "Kunde inte uppdatera receptet",
          description: functionError.message || "Ett fel uppstod",
          variant: "destructive"
        });
        throw new Error(functionError.message || 'Failed to update recipe details');
      }
      
      if (!data || !data.success) {
        toast({
          title: "Kunde inte uppdatera receptet",
          description: data?.error || "Ett fel uppstod",
          variant: "destructive"
        });
        throw new Error(data?.error || 'Unknown error occurred');
      }
      
      // Re-fetch the recipe to get the updated data
      const success = await fetchRecipe(recipeId);
      
      if (success) {
        toast({
          title: "Receptet uppdaterades",
          description: "Den senaste informationen har hämtats"
        });
      } else {
        toast({
          title: "Receptet kunde inte hittas",
          description: "Även efter uppdatering kunde receptet inte hittas",
          variant: "destructive"
        });
      }
    } catch (err) {
      console.error('Error updating recipe details:', err);
      toast({
        title: "Ett fel uppstod",
        description: err instanceof Error ? err.message : "Kunde inte uppdatera receptet",
        variant: "destructive"
      });
    } finally {
      setRefreshing(false);
    }
  };

  return { recipe, loading, error, scrapeRecipe, refreshing };
};
