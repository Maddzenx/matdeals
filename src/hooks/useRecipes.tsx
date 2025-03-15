
import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";

export interface Recipe {
  id: string;
  title: string;
  description: string | null;
  image_url: string | null;
  time_minutes: number | null;
  servings: number | null;
  difficulty: string | null;
  tags: string[] | null;
  ingredients: string[] | null;
  instructions: string[] | null;
  source_url: string | null;
  category: string | null;
  price: number | null;
  original_price: number | null;
}

export const useRecipes = (initialCategory: string = "Matlådevänligt") => {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>(initialCategory);
  const [categories, setCategories] = useState<string[]>([]);

  const fetchRecipes = useCallback(async (category?: string) => {
    try {
      setLoading(true);
      setError(null);
      
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
        setRecipes(data as Recipe[]);
      }
    } catch (err) {
      console.error('Error fetching recipes:', err);
      setError(err instanceof Error ? err : new Error('Unknown error occurred'));
      
      toast({
        title: "Fel vid laddning av recept",
        description: "Kunde inte ladda recept från databasen. Försök igen senare.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchCategories = useCallback(async () => {
    try {
      const { data, error: queryError } = await supabase
        .from('recipes')
        .select('tags, category');
        
      if (queryError) {
        console.error("Error fetching categories:", queryError);
        throw queryError;
      }
      
      if (data) {
        const allTags = data.flatMap(recipe => recipe.tags || []);
        const categoryValues = data.map(recipe => recipe.category).filter(Boolean);
        
        const allCategories = [...allTags, ...categoryValues];
        const uniqueCategories = [...new Set(allCategories)];
        
        uniqueCategories.sort();
        
        const priorityCategories = ["Matlådevänligt", "Budget", "Veganskt", "Vegetariskt", "Middag"];
        
        const regularCategories = uniqueCategories.filter(
          cat => !priorityCategories.includes(cat)
        );
        
        const availableCategories = [
          ...priorityCategories.filter(cat => uniqueCategories.includes(cat)),
          ...regularCategories
        ];
        
        setCategories(availableCategories.length > 0 ? availableCategories : ["Middag", "Vegetariskt"]);
        console.log("Available categories:", availableCategories.length > 0 ? availableCategories : ["Middag", "Vegetariskt"]);
        
        if (availableCategories.length > 0 && !availableCategories.includes(activeCategory)) {
          setActiveCategory(availableCategories[0]);
        }
      }
    } catch (err) {
      console.error("Error loading categories:", err);
      // Set default categories if none found
      setCategories(["Middag", "Vegetariskt"]);
    }
  }, [activeCategory]);

  const scrapeRecipes = useCallback(async () => {
    try {
      setLoading(true);
      
      console.log("Invoking scrape-recipes edge function...");
      
      const { data, error: functionError } = await supabase.functions.invoke("scrape-recipes", {
        method: 'POST',
        body: {} // Empty body for POST request
      });
      
      if (functionError) {
        console.error("Edge function error:", functionError);
        throw new Error(functionError.message || 'Failed to scrape recipes');
      }
      
      console.log("Edge function response:", data);
      
      toast({
        title: "Recept uppdaterade",
        description: `${data.recipesCount} recept har hämtats från godare.se`,
      });
      
      await fetchCategories();
      await fetchRecipes(activeCategory);
      
      return { success: true, count: data.recipesCount };
    } catch (err) {
      console.error('Error scraping recipes:', err);
      
      toast({
        title: "Fel vid hämtning av recept",
        description: err instanceof Error ? err.message : 'Ett okänt fel inträffade',
        variant: "destructive"
      });
      
      return { success: false, error: err instanceof Error ? err.message : 'Unknown error' };
    } finally {
      setLoading(false);
    }
  }, [activeCategory, fetchCategories, fetchRecipes]);

  const changeCategory = useCallback((category: string) => {
    setActiveCategory(category);
    fetchRecipes(category);
  }, [fetchRecipes]);

  useEffect(() => {
    fetchCategories();
    fetchRecipes(activeCategory);
  }, [fetchCategories, fetchRecipes, activeCategory]);

  return {
    recipes,
    loading,
    error,
    activeCategory,
    categories,
    changeCategory,
    scrapeRecipes
  };
};
