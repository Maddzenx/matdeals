
import React from "react";
import { Recipe } from "@/types/recipe";
import { CompactRecipeCard } from "./CompactRecipeCard";
import { LoadingIndicator } from "@/components/LoadingIndicator";

interface PreviousRecipesProps {
  recipes: Recipe[];
  loading: boolean;
  onToggleFavorite: (recipeId: string) => void;
  onAddToMealPlan: (recipeId: string) => void;
}

export const PreviousRecipes: React.FC<PreviousRecipesProps> = ({
  recipes,
  loading,
  onToggleFavorite,
  onAddToMealPlan
}) => {
  if (loading) {
    return <LoadingIndicator message="Laddar tidigare recept..." />;
  }

  if (recipes.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Du har inga tidigare recept ännu.</p>
        <p className="text-gray-500 text-sm mt-2">
          När du lägger till recept i din matsedel sparas de här för enkel åtkomst.
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
          isFavorite={false} // We'll check this inside the component
          onToggleFavorite={() => onToggleFavorite(recipe.id)}
          onAddToMealPlan={() => onAddToMealPlan(recipe.id)}
        />
      ))}
    </div>
  );
};
