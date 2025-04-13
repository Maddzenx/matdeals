import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Recipe, convertDatabaseRecipeToRecipe, RecipeIngredient } from "@/types/recipe";
import { Product } from "@/data/types";
import { useCart } from "./useCart";
import { useProductMatch } from "./useProductMatch";
import { useMealPlan } from "./useMealPlan";
import { ShoppingCartProduct } from "./useCart";
import { MatchedIngredient } from "@/types/matchedIngredient";

type JsonIngredient = {
  name: string;
  amount: string;
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
        
        if (!supabase) {
          throw new Error('Supabase client not initialized');
        }

        const { data, error: supabaseError } = await supabase
          .from('recipes')
          .select('*')
          .eq('id', recipeId)
          .single();

        if (supabaseError) {
          if (supabaseError.code === 'PGRST116') {
            setError('Recipe not found');
            setLoading(false);
            navigate('/recipes');
            return;
          }
          throw supabaseError;
        }

        if (!data) {
          setError('Recipe not found');
          setLoading(false);
          navigate('/recipes');
          return;
        }

        if (!isValidRecipeData(data)) {
          throw new Error('Invalid recipe data received from database');
        }

        const ingredients = Array.isArray(data.ingredients) 
          ? data.ingredients
              .filter((ing): ing is JsonIngredient => 
                ing !== null && 
                typeof ing === 'object' && 
                'name' in ing && 
                typeof ing.name === 'string' &&
                'amount' in ing && 
                typeof ing.amount === 'string')
              .map(ing => ({
                name: ing.name,
                amount: ing.amount,
                unit: ing.unit,
                notes: ing.notes
              }))
          : [];
        
        const recipeData: DatabaseRecipe = {
          ...data,
          ingredients
        };
        
        const recipe = convertDatabaseRecipeToRecipe(recipeData);
        setRecipe(recipe);
        
        const { matchedProducts, matchedIngredients } = findMatchingProducts(recipe.ingredients);
        setRecipeProducts(matchedProducts);
        setMatchedIngredients(matchedIngredients);
        
        break;
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
  }, [recipeId, navigate, findMatchingProducts]);

  useEffect(() => {
    fetchRecipeDetails();
  }, [fetchRecipeDetails]);

  const handleAddToShoppingList = async (recipe: Recipe) => {
    try {
      const productsToAdd = recipe.matchedProducts || [];
      for (const product of productsToAdd) {
        const price = parseFloat(product.currentPrice.replace(/[^0-9,.]/g, '').replace(',', '.'));
        if (isNaN(price)) {
          console.warn(`Invalid price format for product ${product.name}: ${product.currentPrice}`);
          continue;
        }

        const cartProduct: ShoppingCartProduct = {
          id: product.id,
          name: product.name,
          price,
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
  return (
    typeof data === 'object' &&
    data !== null &&
    typeof data.id === 'string' &&
    typeof data.title === 'string' &&
    typeof data.category === 'string' &&
    Array.isArray(data.instructions) &&
    (data.description === null || typeof data.description === 'string') &&
    (data.image_url === undefined || typeof data.image_url === 'string') &&
    (data.time_minutes === null || typeof data.time_minutes === 'number') &&
    (data.servings === null || typeof data.servings === 'number') &&
    (data.difficulty === null || typeof data.difficulty === 'string') &&
    (data.source_url === null || typeof data.source_url === 'string')
  );
}
