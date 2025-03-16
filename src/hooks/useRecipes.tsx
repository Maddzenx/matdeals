
import { useEffect, useState, useCallback } from "react";
import { Recipe } from "@/types/recipe";
import { useSupabaseProducts } from "@/hooks/useSupabaseProducts";
import { 
  fetchRecipesByCategory, 
  scrapeRecipesFromApi 
} from "@/services/recipeService";
import { fetchRecipeCategories } from "@/utils/recipeCategories";

export type { Recipe } from "@/types/recipe";

export const useRecipes = (initialCategory: string = "Middag") => {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>(initialCategory);
  const [categories, setCategories] = useState<string[]>([]);
  
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
    const { categories: fetchedCategories, newActiveCategory } = 
      await fetchRecipeCategories(activeCategory);
    
    setCategories(fetchedCategories);
    
    // Update active category if needed
    if (newActiveCategory) {
      setActiveCategory(newActiveCategory);
    }
  }, [activeCategory]);

  const scrapeRecipes = useCallback(async (showNotification = false) => {
    try {
      setLoading(true);
      
      const result = await scrapeRecipesFromApi(showNotification);
      
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
