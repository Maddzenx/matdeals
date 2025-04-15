import React from 'react';
import { useParams } from 'react-router-dom';
import { DetailedRecipeView } from '@/components/recipe-detail/DetailedRecipeView';
import { useRecipeDetail } from '@/hooks/useRecipeDetail';
import { useFavorites } from '@/hooks/useFavorites';
import { useCart } from '@/hooks/useCart';
import { useMealPlan } from '@/hooks/useMealPlan';
import { LoadingIndicator } from '@/components/LoadingIndicator';
import { RecipeThemeProvider } from '@/components/recipe-theme-provider';

export default function RecipeDetail() {
  const { id } = useParams<{ id: string }>();
  const { recipe, loading, error, recipeProducts, matchedIngredients } = useRecipeDetail(id);
  const { favoriteIds, toggleFavorite } = useFavorites();
  const { addProduct } = useCart();
  const { addToMealPlan } = useMealPlan();

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <LoadingIndicator />
      </div>
    );
  }

  if (error || !recipe) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Något gick fel</h2>
          <p className="text-gray-600">{error || 'Receptet kunde inte hittas'}</p>
        </div>
      </div>
    );
  }

  const handleAddToCart = () => {
    if (recipeProducts.length > 0) {
      recipeProducts.forEach((product) => {
        addProduct({
          ...product,
          quantity: 1,
          checked: false
        });
      });
    }
  };

  const handleAddToMealPlan = async () => {
    if (recipe) {
      await addToMealPlan(recipe.id, 'default');
    }
  };

  const handleToggleFavorite = () => {
    if (recipe) {
      toggleFavorite(recipe.id);
    }
  };

  return (
    <RecipeThemeProvider defaultTheme="light">
      <DetailedRecipeView
        recipe={recipe}
        matchedProducts={recipeProducts}
        matchedIngredients={matchedIngredients}
        onAddToCart={handleAddToCart}
        onAddToMealPlan={handleAddToMealPlan}
        onToggleFavorite={handleToggleFavorite}
        isFavorite={favoriteIds.includes(recipe.id)}
      />
    </RecipeThemeProvider>
  );
}
