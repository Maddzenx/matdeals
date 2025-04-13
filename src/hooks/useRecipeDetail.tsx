import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Recipe, convertDatabaseRecipeToRecipe, RecipeIngredient } from "@/types/recipe";
import { Product } from "@/types/product";
import { useCart } from "./useCart";
import { useProductMatch } from "./useProductMatch";
import { useMealPlan } from "./useMealPlan";
import { ShoppingCartProduct } from "./useCart";
import { MatchedIngredient } from "@/types/matchedIngredient";

type JsonIngredient = {
  name: string;
  amount: string | number;  // Allow both string and number
  unit?: string;
  notes?: string;
};

type DatabaseRecipe = {
  id: string;
  title: string;
  description: string | null;
  instructions: string[];
  category: string;
  created_at: string | null;
  ingredients: RecipeIngredient[];
  image_url?: string;
  time_minutes?: number | null;
  servings?: number | null;
  difficulty?: string | null;
  source_url?: string | null;
};

const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second

export function useRecipeDetail(recipeId: string | undefined) {
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [recipeProducts, setRecipeProducts] = useState<Product[]>([]);
  const [matchedIngredients, setMatchedIngredients] = useState<MatchedIngredient[]>([]);
  const navigate = useNavigate();
  const { addProduct } = useCart();
  const { addToMealPlan } = useMealPlan();
  const { findMatchingProducts } = useProductMatch();

  const fetchRecipeDetails = useCallback(async () => {
    if (!recipeId) {
      setError('No recipe ID provided');
      setLoading(false);
      navigate('/recipes');
      return;
    }

    let retries = 0;
    while (retries < MAX_RETRIES) {
      try {
        setLoading(true);
        const { data, error: fetchError } = await supabase
          .from('recipes')
          .select('*')
          .eq('id', recipeId)
          .single();

        if (fetchError) {
          if (fetchError.code === '42P01') {
            // Table doesn't exist yet, create it
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
              `
            });
            retries++;
            await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
            continue;
          }
          throw fetchError;
        }

        if (!data) {
          setError('Recipe not found');
          setLoading(false);
          return;
        }

        // Validate recipe data
        if (!isValidRecipeData(data)) {
          console.error('Invalid recipe data');
          setError('Invalid recipe data');
          setLoading(false);
          return;
        }

        // Convert ingredients from JSON to array of RecipeIngredient
        const recipe: Recipe = {
          ...data,
          ingredients: (Array.isArray(data.ingredients) ? data.ingredients : [])
            .filter((ing: unknown): ing is JsonIngredient => 
              ing !== null && 
              typeof ing === 'object' &&
              ing !== null &&
              'name' in ing &&
              typeof (ing as JsonIngredient).name === 'string' &&
              'amount' in ing &&
              (typeof (ing as JsonIngredient).amount === 'string' || typeof (ing as JsonIngredient).amount === 'number')
            )
            .map((ing: JsonIngredient) => ({
              name: ing.name,
              amount: String(ing.amount),
              unit: ing.unit || '',
              notes: ing.notes || ''
            }))
        };

        setRecipe(recipe);
        
        // Find matching products and create matched ingredients
        const { matchedProducts, unmatchedIngredients } = findMatchingProducts(recipe.ingredients);
        
        // Create matched ingredients array by combining matched products with recipe ingredients
        const matchedIngs: MatchedIngredient[] = recipe.ingredients.map(ing => {
          const matchedProduct = matchedProducts.find(p => p.name.toLowerCase().includes(ing.name.toLowerCase()));
          return {
            ...ing,
            matchedProduct: matchedProduct || undefined
          };
        });
        
        setRecipeProducts(matchedProducts);
        setMatchedIngredients(matchedIngs);
        
        setLoading(false);
        return;
      } catch (err) {
        console.error('Error fetching recipe details:', err);
        retries++;
        if (retries === MAX_RETRIES) {
          setError(err instanceof Error ? err.message : 'An error occurred while fetching recipe details');
          setLoading(false);
        } else {
          await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
        }
      }
    }
  }, [recipeId, navigate]);

  useEffect(() => {
    fetchRecipeDetails();
  }, [fetchRecipeDetails]);

  const handleAddToShoppingList = async (recipe: Recipe) => {
    try {
      const productsToAdd = recipe.matchedProducts || [];
      for (const product of productsToAdd) {
        const cartProduct: ShoppingCartProduct = {
          id: product.id,
          name: product.name,
          price: 0,
          image: product.image,
          quantity: 1,
          checked: false,
          store: product.store,
          recipeId: recipe.id,
          recipeTitle: recipe.title
        };
        await addProduct(cartProduct);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred while adding products to shopping list';
      console.error('Error adding products to shopping list:', errorMessage);
      throw err;
    }
  };

  const handleAddToMealPlan = async (recipe: Recipe) => {
    try {
      await addToMealPlan(recipe.id, "default");
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred while adding recipe to meal plan';
      console.error('Error adding recipe to meal plan:', errorMessage);
      throw err;
    }
  };

  return {
    recipe,
    loading,
    error,
    recipeProducts,
    matchedIngredients,
    handleAddToShoppingList,
    handleAddToMealPlan,
    refreshRecipe: fetchRecipeDetails
  };
}

function isValidRecipeData(data: any): data is DatabaseRecipe {
  // First check basic object structure
  if (!(
    typeof data === 'object' &&
    data !== null &&
    typeof data.id === 'string' &&
    typeof data.title === 'string' &&
    typeof data.category === 'string' &&
    Array.isArray(data.instructions) &&
    (data.description === null || typeof data.description === 'string') &&
    (data.image_url === undefined || data.image_url === null || typeof data.image_url === 'string') &&
    (data.time_minutes === undefined || data.time_minutes === null || typeof data.time_minutes === 'number') &&
    (data.servings === undefined || data.servings === null || typeof data.servings === 'number') &&
    (data.difficulty === undefined || data.difficulty === null || typeof data.difficulty === 'string') &&
    (data.source_url === undefined || data.source_url === null || typeof data.source_url === 'string')
  )) {
    console.log('Basic structure validation failed');
    return false;
  }

  // Then validate ingredients array
  if (!Array.isArray(data.ingredients)) {
    console.log('Ingredients is not an array');
    return false;
  }

  // Each ingredient should be an object with required properties
  const ingredientsValid = data.ingredients.every((ing: unknown) => {
    if (!(
      ing !== null &&
      typeof ing === 'object' &&
      'name' in ing &&
      'amount' in ing &&
      typeof (ing as any).name === 'string' &&
      (typeof (ing as any).amount === 'string' || typeof (ing as any).amount === 'number') &&
      ((ing as any).unit === undefined || typeof (ing as any).unit === 'string') &&
      ((ing as any).notes === undefined || typeof (ing as any).notes === 'string')
    )) {
      console.log('Invalid ingredient:', ing);
      return false;
    }
    return true;
  });

  if (!ingredientsValid) {
    console.log('Ingredients validation failed');
    return false;
  }

  return true;
}
