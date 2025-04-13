import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Recipe, convertDatabaseRecipeToRecipe, DatabaseRecipe, RecipeIngredient } from "@/types/recipe";
import { useProductMatch } from "./useProductMatch";
import { Json } from "@/integrations/supabase/database.types";

type JsonIngredient = {
  name: string;
  amount: string;
  unit?: string;
  notes?: string;
};

type DatabaseRecipeRow = {
  id: string;
  title: string;
  description: string | null;
  instructions: string[];
  category: string;
  created_at: string | null;
  ingredients: Json;
  image_url?: string;
  time_minutes?: number | null;
  servings?: number | null;
  difficulty?: string | null;
  source_url?: string | null;
};

function isJsonIngredient(value: unknown): value is JsonIngredient {
  return (
    typeof value === 'object' &&
    value !== null &&
    'name' in value &&
    typeof (value as JsonIngredient).name === 'string' &&
    'amount' in value &&
    typeof (value as JsonIngredient).amount === 'string'
  );
}

export function useRecipes() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [categories, setCategories] = useState<string[]>([]);
  const { findMatchingProducts } = useProductMatch();
  const isMounted = useRef(true);
  const fetchCount = useRef(0);
  const lastFetchTime = useRef<number>(0);

  const fetchRecipes = useCallback(async () => {
    if (!isMounted.current || fetchCount.current > 0) return;
    fetchCount.current++;

    try {
      setLoading(true);
      const { data, error: supabaseError } = await supabase
        .from('recipes')
        .select('*')
        .order('created_at', { ascending: false });

      if (supabaseError) throw supabaseError;

      if (data) {
        const recipesWithProducts = await Promise.all(
          data.map(async (recipe: DatabaseRecipeRow) => {
            const ingredients = Array.isArray(recipe.ingredients) 
              ? recipe.ingredients
                  .filter(isJsonIngredient)
                  .map(ing => ({
                    name: ing.name,
                    amount: ing.amount,
                    unit: ing.unit,
                    notes: ing.notes
                  }))
              : [];

            const recipeData: DatabaseRecipe = {
              ...recipe,
              ingredients
            };

            const { matchedProducts } = findMatchingProducts(ingredients);
            return {
              ...convertDatabaseRecipeToRecipe(recipeData),
              matchedProducts,
            };
          })
        );

        if (isMounted.current) {
          setRecipes(recipesWithProducts);
          
          const uniqueCategories = Array.from(
            new Set(data.map(recipe => recipe.category))
          );
          setCategories(['all', ...uniqueCategories]);
        }
      }
    } catch (err) {
      if (isMounted.current) {
        setError(err instanceof Error ? err.message : 'An error occurred');
        console.error('Error fetching recipes:', err);
      }
    } finally {
      if (isMounted.current) {
        setLoading(false);
        fetchCount.current = 0;
      }
    }
  }, [findMatchingProducts]);

  const refreshRecipes = useCallback(async () => {
    const now = Date.now();
    if (now - lastFetchTime.current < 5000) {
      console.log('Rate limiting - skipping refresh');
      return;
    }
    
    try {
      lastFetchTime.current = now;
      await fetchRecipes();
    } catch (err) {
      console.error('Error refreshing recipes:', err);
      if (isMounted.current) {
        setError(err instanceof Error ? err.message : 'An error occurred while refreshing recipes');
      }
    }
  }, [fetchRecipes]);

  const changeCategory = useCallback((category: string) => {
    setActiveCategory(category);
  }, []);

  useEffect(() => {
    isMounted.current = true;
    fetchRecipes();

    return () => {
      isMounted.current = false;
      fetchCount.current = 0;
    };
  }, [fetchRecipes]);

  return {
    recipes: activeCategory === "all" 
      ? recipes 
      : recipes.filter(recipe => recipe.category === activeCategory),
    loading,
    error,
    activeCategory,
    categories,
    changeCategory,
    refreshRecipes
  };
} 