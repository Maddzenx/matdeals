import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Recipe, convertDatabaseRecipeToRecipe, DatabaseRecipe, RecipeIngredient } from "@/types/recipe";
import { useProductMatch } from "./useProductMatch";
import { Json } from "@/integrations/supabase/database.types";
import { Product } from "@/data/types";

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
      const { data: recipesData, error: supabaseError } = await supabase
        .from('recipes')
        .select('*')
        .order('created_at', { ascending: false });

      if (supabaseError) {
        if (supabaseError.code === '42P01') {
          // Table doesn't exist, create it
          await supabase.rpc('create_tables', {
            sql: `
              -- Create recipes table
              CREATE TABLE IF NOT EXISTS public.recipes (
                id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
                title TEXT NOT NULL UNIQUE,
                description TEXT,
                instructions TEXT[] NOT NULL,
                category TEXT NOT NULL,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
                ingredients JSONB NOT NULL,
                image_url TEXT,
                time_minutes INTEGER,
                servings INTEGER,
                difficulty TEXT,
                source_url TEXT
              );

              ALTER TABLE public.recipes ENABLE ROW LEVEL SECURITY;

              CREATE POLICY "Public recipes are viewable by everyone"
                ON public.recipes
                FOR SELECT
                USING (true);

              -- Create favorites table
              CREATE TABLE IF NOT EXISTS public.favorites (
                id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
                user_id UUID NOT NULL,
                recipe_id UUID NOT NULL REFERENCES public.recipes(id) ON DELETE CASCADE,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
                UNIQUE(user_id, recipe_id)
              );

              ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;

              CREATE POLICY "Users can view their own favorites"
                ON public.favorites
                FOR SELECT
                USING (auth.uid() = user_id);

              CREATE POLICY "Users can insert their own favorites"
                ON public.favorites
                FOR INSERT
                WITH CHECK (auth.uid() = user_id);

              CREATE POLICY "Users can delete their own favorites"
                ON public.favorites
                FOR DELETE
                USING (auth.uid() = user_id);
            `
          });

          // Try fetching again after creating the table
          const { data: retryData, error: retryError } = await supabase
            .from('recipes')
            .select('*')
            .order('created_at', { ascending: false });

          if (retryError) throw retryError;
          if (retryData) {
            const processedRecipes = await processRecipeData(retryData);
            if (isMounted.current) {
              setRecipes(processedRecipes);
              updateCategories(retryData);
            }
          }
        } else {
          throw supabaseError;
        }
      } else if (recipesData) {
        const processedRecipes = await processRecipeData(recipesData);
        if (isMounted.current) {
          setRecipes(processedRecipes);
          updateCategories(recipesData);
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

  const processRecipeData = async (data: DatabaseRecipeRow[]) => {
    return Promise.all(
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
        const processedRecipe: Recipe = {
          ...convertDatabaseRecipeToRecipe(recipeData),
          matchedProducts: matchedProducts as Product[]
        };
        return processedRecipe;
      })
    );
  };

  const updateCategories = (data: DatabaseRecipeRow[]) => {
    const uniqueCategories = Array.from(
      new Set(data.map(recipe => recipe.category))
    );
    setCategories(['all', ...uniqueCategories]);
  };

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
    refreshRecipes,
    scrapeRecipes: refreshRecipes // Alias refreshRecipes as scrapeRecipes for backward compatibility
  };
} 