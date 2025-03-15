
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
        
      // Apply category filter if provided
      if (category) {
        // Look for the category either in the category field or in the tags array
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
        // Extract all tags from all recipes
        const allTags = data.flatMap(recipe => recipe.tags || []);
        // Get categories from the category field
        const categoryValues = data.map(recipe => recipe.category).filter(Boolean);
        
        // Combine all unique category values
        const allCategories = [...allTags, ...categoryValues];
        const uniqueCategories = [...new Set(allCategories)];
        
        // Sort categories alphabetically
        uniqueCategories.sort();
        
        // Prioritize specific categories to appear first
        const priorityCategories = ["Matlådevänligt", "Budget", "Veganskt", "Vegetariskt"];
        
        // Filter out priority categories from the unique list
        const regularCategories = uniqueCategories.filter(
          cat => !priorityCategories.includes(cat)
        );
        
        // Combine with priority categories first
        const availableCategories = [
          ...priorityCategories.filter(cat => uniqueCategories.includes(cat)),
          ...regularCategories
        ];
        
        setCategories(availableCategories);
        console.log("Available categories:", availableCategories);
        
        // If the current active category is not in the available categories,
        // and there are available categories, set the first one as active
        if (availableCategories.length > 0 && !availableCategories.includes(activeCategory)) {
          setActiveCategory(availableCategories[0]);
        }
      }
    } catch (err) {
      console.error("Error loading categories:", err);
    }
  }, [activeCategory]);

  const scrapeRecipes = useCallback(async () => {
    try {
      setLoading(true);
      
      const response = await fetch(`${window.location.origin}/functions/v1/scrape-recipes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      if (!response.ok) {
        const text = await response.text();
        let errorData;
        try {
          errorData = JSON.parse(text);
        } catch (e) {
          errorData = { error: `Server returned status ${response.status}: ${text}` };
        }
        throw new Error(errorData.error || `Failed to scrape recipes: ${response.statusText}`);
      }
      
      const result = await response.json();
      
      toast({
        title: "Recept uppdaterade",
        description: `${result.recipesCount} recept har hämtats från godare.se`,
      });
      
      // Reload recipes and categories
      await fetchCategories();
      await fetchRecipes(activeCategory);
      
      return { success: true, count: result.recipesCount };
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

  // Change active category
  const changeCategory = useCallback((category: string) => {
    setActiveCategory(category);
    fetchRecipes(category);
  }, [fetchRecipes]);

  // Initial load
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
