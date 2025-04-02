import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Recipe, convertDatabaseRecipeToRecipe } from "@/types/recipe";
import { Product } from "@/data/types";
import { useCart } from "./useCart";
import { useProductMatch } from "./useProductMatch";
import { useMealPlan } from "./useMealPlan";

export function useRecipeDetail(recipeId: string | undefined) {
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [recipeProducts, setRecipeProducts] = useState<Product[]>([]);
  const [matchedIngredients, setMatchedIngredients] = useState<any[]>([]);
  const navigate = useNavigate();
  const { addProduct } = useCart();
  const { addRecipeToMealPlan } = useMealPlan();
  const { findMatchingProducts } = useProductMatch();

  useEffect(() => {
    
    async function fetchRecipeDetails() {
      if (!recipeId) return;
      
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('recipes')
          .select('*')
          .eq('id', recipeId)
          .single();
          
        if (error) {
          throw error;
        }
        
        if (data) {
          // Convert database recipe to frontend Recipe type
          const recipe = convertDatabaseRecipeToRecipe(data);
          setRecipe(recipe);
          
          // Find matching products for the recipe
          if (recipe?.ingredients) {
            const { matchedProducts, matchedIngredients } = findMatchingProducts(recipe.ingredients);
            setRecipeProducts(matchedProducts);
            setMatchedIngredients(matchedIngredients);
          }
        }
      } catch (error) {
        console.error('Error fetching recipe:', error);
        setError(error instanceof Error ? error.message : 'Failed to fetch recipe');
      } finally {
        setLoading(false);
      }
    }

    fetchRecipeDetails();
  }, [recipeId, navigate, findMatchingProducts]);

  const handleAddToShoppingList = async (recipe: Recipe) => {
    if (!recipe) return;

    // Check if recipe has matched products
    if (!recipe.matchedProducts || recipe.matchedProducts.length === 0) {
      console.warn("No matched products found for this recipe.");
      return;
    }

    // Add each matched product to the shopping list
    recipe.matchedProducts.forEach(product => {
      addProduct({
        id: product.id,
        name: product.name,
        price: parseFloat(product.currentPrice.replace(/[^0-9,.]/g, '').replace(',', '.')),
        image: product.image,
        quantity: 1,
        checked: false
      });
    });
  };

  const handleAddToMealPlan = async (recipe: Recipe) => {
    if (!recipe) return;
    addRecipeToMealPlan(recipe);
  };
  
  // Make sure to return the updated state
  return {
    recipe,
    loading,
    error,
    products: recipeProducts,
    matchedIngredients,
    handleAddToShoppingList,
    handleAddToMealPlan
  };
}
