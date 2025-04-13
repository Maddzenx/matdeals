import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Recipe, convertDatabaseRecipeToRecipe, RecipeIngredient } from "@/types/recipe";
import { Product } from "@/data/types";
import { useCart } from "./useCart";
import { useProductMatch } from "./useProductMatch";
import { useMealPlan } from "./useMealPlan";
import { ShoppingCartProduct } from "./useCart";

interface MatchedIngredient {
  name: string;
  amount?: string;
  unit?: string;
  notes?: string;
  matchedProduct?: Product;
}

interface DatabaseRecipe {
  id: string;
  title: string;
  description: string | null;
  instructions: string[];
  category: string;
  created_at?: string | null;
  ingredients: RecipeIngredient[];
  image_url?: string;
  time_minutes?: number | null;
  servings?: number | null;
  difficulty?: string | null;
  source_url?: string | null;
}

type JsonIngredient = {
  name: string;
  amount?: string;
  unit?: string;
  notes?: string;
};

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

  useEffect(() => {
    async function fetchRecipeDetails() {
      if (!recipeId) {
        setError('No recipe ID provided');
        setLoading(false);
        return;
      }
      
      try {
        setLoading(true);
        const { data, error: supabaseError } = await supabase
          .from('recipes')
          .select('*')
          .eq('id', recipeId)
          .single();

        if (supabaseError) throw supabaseError;

        if (!data) {
          setError('Recipe not found');
          setLoading(false);
          return;
        }

        // Convert ingredients from JSON to RecipeIngredient[]
        const ingredients = Array.isArray(data.ingredients) 
          ? data.ingredients
              .filter((ing): ing is JsonIngredient => 
                ing !== null && 
                typeof ing === 'object' && 
                'name' in ing && 
                typeof ing.name === 'string')
              .map(ing => ({
                name: ing.name,
                amount: ing.amount || '',
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
        
        // Find matching products for recipe ingredients
        const { matchedProducts, matchedIngredients } = findMatchingProducts(recipe.ingredients);
        setRecipeProducts(matchedProducts);
        setMatchedIngredients(matchedIngredients);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'An error occurred while fetching recipe details';
        setError(errorMessage);
        console.error('Error fetching recipe:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchRecipeDetails();
  }, [recipeId, findMatchingProducts]);

  const handleAddToShoppingList = async (recipe: Recipe) => {
    if (!recipe.matchedProducts || recipe.matchedProducts.length === 0) {
      console.warn('No matched products found for recipe');
      return;
    }

    try {
      // Add each product to the shopping list
      for (const product of recipe.matchedProducts) {
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
  };
}
