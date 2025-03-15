
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Recipe } from "./useRecipes";
import { useToast } from "@/components/ui/use-toast";

export const useRecipeDetail = (id: string | undefined) => {
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const { toast } = useToast();

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
          toast({
            title: "Recept hittades inte",
            description: "Det begärda receptet kunde inte hittas.",
            variant: "destructive"
          });
        }
      } catch (err) {
        console.error("Error fetching recipe details:", err);
        setError(err instanceof Error ? err : new Error("Unknown error occurred"));
        toast({
          title: "Fel vid laddning av recept",
          description: "Kunde inte ladda receptdetaljer. Vänligen försök igen senare.",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    fetchRecipe();
  }, [id, toast]);

  const scrapeRecipe = async (recipeId: string) => {
    if (!recipeId) return;
    
    try {
      setLoading(true);
      
      toast({
        title: "Uppdaterar recept",
        description: "Hämtar detaljerad information från källan...",
      });
      
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
        toast({
          title: "Recept uppdaterat",
          description: "Receptet har uppdaterats med detaljerad information.",
        });
      }
    } catch (err) {
      console.error('Error updating recipe details:', err);
      toast({
        title: "Fel vid uppdatering",
        description: err instanceof Error ? err.message : 'Ett okänt fel inträffade',
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return { recipe, loading, error, scrapeRecipe };
};
