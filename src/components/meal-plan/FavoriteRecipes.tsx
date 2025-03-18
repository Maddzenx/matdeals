
import React from "react";
import { Recipe } from "@/types/recipe";
import { CompactRecipeCard } from "./CompactRecipeCard";
import { LoadingIndicator } from "@/components/LoadingIndicator";
import { DayMeal } from "@/types/mealPlan";

interface FavoriteRecipesProps {
  recipes: Recipe[];
  loading: boolean;
  onToggleFavorite: (recipeId: string) => void;
  onAddToMealPlan: (recipeId: string) => void;
  mealPlan?: DayMeal[];
  onSelectDay?: (day: string, recipeId: string) => void;
}

export const FavoriteRecipes: React.FC<FavoriteRecipesProps> = ({
  recipes,
  loading,
  onToggleFavorite,
  onAddToMealPlan,
  mealPlan,
  onSelectDay
}) => {
  if (loading) {
    return <LoadingIndicator message="Laddar favoritrecept..." />;
  }

  if (recipes.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Du har inga favoritrecept ännu.</p>
        <p className="text-gray-500 text-sm mt-2">
          Bläddra bland recept och klicka på hjärtat för att lägga till favoriter.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4">
      {recipes.map(recipe => (
        <CompactRecipeCard
          key={recipe.id}
          recipe={recipe}
          isFavorite={true}
          onToggleFavorite={() => onToggleFavorite(recipe.id)}
          onAddToMealPlan={() => onAddToMealPlan(recipe.id)}
          mealPlan={mealPlan}
          onSelectDay={onSelectDay}
        />
      ))}
    </div>
  );
};
