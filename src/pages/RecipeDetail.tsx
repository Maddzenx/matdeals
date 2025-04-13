import React from "react";
import { useParams } from "react-router-dom";
import { useRecipeDetail } from "@/hooks/useRecipeDetail";
import { useFavorites } from "@/hooks/useFavorites";
import { LoadingIndicator } from "@/components/LoadingIndicator";
import { ErrorMessage } from "@/components/ErrorMessage";
import { DetailedRecipeView } from "@/components/recipe-detail/DetailedRecipeView";

const RecipeDetail = () => {
  const { id } = useParams();
  const { 
    recipe, 
    loading, 
    error, 
    recipeProducts, 
    matchedIngredients,
    handleAddToShoppingList,
    handleAddToMealPlan,
    refreshRecipe
  } = useRecipeDetail(id);
  
  const { favoriteIds, toggleFavorite } = useFavorites();

  if (loading) {
    return <LoadingIndicator />;
  }

  if (error || !recipe) {
    return <ErrorMessage message={error || "Kunde inte hitta receptet"} />;
  }

  return (
    <DetailedRecipeView
      recipe={recipe}
      matchedProducts={recipeProducts}
      matchedIngredients={matchedIngredients}
      onAddToCart={() => handleAddToShoppingList(recipe)}
      onAddToMealPlan={() => handleAddToMealPlan(recipe)}
      onToggleFavorite={() => toggleFavorite(recipe.id)}
      isFavorite={favoriteIds.includes(recipe.id)}
    />
  );
};

export default RecipeDetail;
