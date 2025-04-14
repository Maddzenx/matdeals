import { useState, useEffect } from 'react';
import { Recipe } from '@/types/recipe';

export function useFavorites() {
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);
  const [favoriteRecipes, setFavoriteRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load favorites from localStorage
  useEffect(() => {
    try {
      const storedFavorites = localStorage.getItem('favoriteRecipes');
      if (storedFavorites) {
        const favIds = JSON.parse(storedFavorites);
        setFavoriteIds(favIds);
      }
      setLoading(false);
    } catch (err) {
      console.error('Error loading favorites:', err);
      setError('Failed to load favorites');
      setLoading(false);
    }
  }, []);

  // Toggle a recipe's favorite status
  const toggleFavorite = (recipeId: string) => {
    try {
      let updatedFavorites: string[];
      
      if (favoriteIds.includes(recipeId)) {
        // Remove from favorites
        updatedFavorites = favoriteIds.filter(id => id !== recipeId);
      } else {
        // Add to favorites
        updatedFavorites = [...favoriteIds, recipeId];
      }
      
      setFavoriteIds(updatedFavorites);
      localStorage.setItem('favoriteRecipes', JSON.stringify(updatedFavorites));
      
      return true;
    } catch (err) {
      console.error('Error toggling favorite:', err);
      return false;
    }
  };

  // Fetch favorite recipes from database
  const fetchFavoriteRecipes = async () => {
    // Implementation (omitted for brevity)
  };

  // Load favorite recipes on component mount and when favoriteIds change
  useEffect(() => {
    if (favoriteIds.length > 0) {
      fetchFavoriteRecipes();
    } else {
      setFavoriteRecipes([]);
    }
  }, [favoriteIds]);

  return {
    favoriteIds,
    favoriteRecipes,
    toggleFavorite,
    loading,
    error
  };
}
