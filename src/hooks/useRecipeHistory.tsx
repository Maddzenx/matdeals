
import { useState, useEffect, useCallback } from "react";
import { Recipe } from "@/types/recipe";

export const useRecipeHistory = (
  recipes: Recipe[],
  initialHistoryIds: string[],
  saveCallback: (historyIds: string[]) => void
) => {
  const [previousRecipes, setPreviousRecipes] = useState<Recipe[]>([]);
  const [historyIds, setHistoryIds] = useState<string[]>(initialHistoryIds);

  // Update history when recipe data is loaded
  useEffect(() => {
    if (recipes.length > 0) {
      const updatedHistory = recipes.filter(recipe => 
        historyIds.includes(recipe.id)
      );
      
      setPreviousRecipes(updatedHistory);
    }
  }, [recipes, historyIds]);

  // Save history IDs whenever they change
  useEffect(() => {
    saveCallback(historyIds);
  }, [historyIds, saveCallback]);

  // Add a recipe to history if not already present
  const addToHistory = useCallback((recipeId: string) => {
    if (!historyIds.includes(recipeId)) {
      setHistoryIds(prev => [...prev, recipeId]);
    }
  }, [historyIds]);

  return { previousRecipes, historyIds, addToHistory };
};
