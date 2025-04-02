import { useEffect, useState, useCallback } from "react";
import { Recipe } from "@/types/recipe";
import { useSupabaseProducts } from "@/hooks/useSupabaseProducts";
import { 
  fetchRecipesByCategory, 
  scrapeRecipesFromApi 
} from "@/services/recipeService";
import { getRecipeCategories, RecipeCategory } from "@/utils/recipeCategories";
import { useAppSession } from "@/hooks/useAppSession";

export type { Recipe } from "@/types/recipe";

export const useRecipes = (initialCategory: string = "Middag") => {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>(initialCategory);
  const [categories, setCategories] = useState<string[]>([]);
  const { isFirstLoad } = useAppSession();
  
  // Get products for matching with ingredients
  const { products } = useSupabaseProducts();

  const fetchRecipes = useCallback(async (category?: string) => {
    try {
      setLoading(true);
      setError(null);
      
      const fetchedRecipes = await fetchRecipesByCategory(category, products);
      setRecipes(fetchedRecipes);
    } catch (err) {
      console.error('Error fetching recipes:', err);
      setError(err instanceof Error ? err : new Error('Unknown error occurred'));
    } finally {
      setLoading(false);
    }
  }, [products]);

  const fetchCategories = useCallback(async () => {
    try {
      const result = await getRecipeCategories();
      
      if (Array.isArray(result)) {
        // Extract category names and set them
        const categoryNames = result.map(cat => cat.name);
        setCategories(categoryNames);
        
        // If active category not in the list, update it
        if (categoryNames.length > 0 && !categoryNames.includes(activeCategory)) {
          setActiveCategory(categoryNames[0]);
        }
      } else {
        // Handle the case where getRecipeCategories returns an object
        const { categories: fetchedCategories, newActiveCategory } = result;
        
        if (Array.isArray(fetchedCategories)) {
          const categoryNames = fetchedCategories.map(cat => cat.name);
          setCategories(categoryNames);
        }
        
        // Update active category if needed
        if (newActiveCategory) {
          setActiveCategory(newActiveCategory);
        }
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  }, [activeCategory]);

  const scrapeRecipes = useCallback(async () => {
    try {
      setLoading(true);
      
      const result = await scrapeRecipesFromApi(false); // Don't show notifications
      
      // Refresh categories and recipes after scraping
      await fetchCategories();
      await fetchRecipes(activeCategory);
      
      return result;
    } catch (err) {
      console.error('Error scraping recipes:', err);
      return { success: false, error: err instanceof Error ? err.message : 'Unknown error' };
    } finally {
      setLoading(false);
    }
  }, [activeCategory, fetchCategories, fetchRecipes]);

  // Auto scrape recipes on first app load
  useEffect(() => {
    if (isFirstLoad) {
      console.log("First load of app, auto-scraping recipes");
      const timer = setTimeout(() => {
        scrapeRecipes();
      }, 3000); // Delay to not impact initial rendering
      
      return () => clearTimeout(timer);
    }
  }, [isFirstLoad, scrapeRecipes]);

  const changeCategory = useCallback((category: string) => {
    setActiveCategory(category);
    fetchRecipes(category);
  }, [fetchRecipes]);

  // Update recipes when products change
  useEffect(() => {
    if (products.length > 0 && recipes.length > 0) {
      console.log("Products updated, recalculating recipe prices...");
      
      // Re-fetch recipes to update calculated prices
      fetchRecipes(activeCategory);
    }
  }, [products, activeCategory, fetchRecipes]);

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
