
import React from "react";
import { Recipe } from "@/types/recipe";
import { DayMeal } from "@/types/mealPlan";

interface RecipeActionsProps {
  recipe: Recipe;
  favoriteIds: string[];
  mealPlan: DayMeal[];
  onFavoriteToggle: () => void;
  onAddToMealPlan: (day: string, recipeId: string) => void;
}

// This component is now empty as the actions have been moved to the TopNavigationBar
export const RecipeActions: React.FC<RecipeActionsProps> = () => {
  // Return an empty div with no height to avoid layout shifts
  return null;
};
