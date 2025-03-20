
import { useState, useEffect, useCallback } from "react";
import { Recipe } from "@/types/recipe";

export const useFavoriteRecipes = (
  recipes: Recipe[],
  initialFavoriteIds: string[],
  saveCallback: (favoriteIds: string[]) => void
) => {
  const [favorites, setFavorites] = useState<Recipe[]>([]);
  const [favoriteIds, setFavoriteIds] = useState<string[]>(initialFavoriteIds);

  // Update favorites when recipe data is loaded
  useEffect(() => {
    if (recipes.length > 0) {
      const updatedFavorites = recipes.filter(recipe => 
        favoriteIds.includes(recipe.id)
      );
      
      setFavorites(updatedFavorites);
    }
  }, [recipes, favoriteIds]);

  // Save favorite IDs whenever they change
  useEffect(() => {
    saveCallback(favoriteIds);
  }, [favoriteIds, saveCallback]);

  // Toggle a recipe as favorite
  const toggleFavorite = useCallback((recipeId: string) => {
    setFavoriteIds(prev => {
      if (prev.includes(recipeId)) {
        return prev.filter(id => id !== recipeId);
      } else {
        return [...prev, recipeId];
      }
    });
  }, []);

  return { favorites, favoriteIds, toggleFavorite };
};
