
import { useCallback } from "react";
import { Recipe } from "@/types/recipe";
import { useRecipes } from "@/hooks/useRecipes";
import { useMealPlanStorage } from "@/hooks/useMealPlanStorage";
import { useFavoriteRecipes } from "@/hooks/useFavoriteRecipes";
import { useRecipeHistory } from "@/hooks/useRecipeHistory";
import { toast } from "sonner";

export const useMealPlan = () => {
  const { recipes } = useRecipes();
  
  // Use our storage hook for persistent state
  const { 
    mealPlan, 
    setMealPlan, 
    favoriteIds, 
    historyIds,
    loading,
    updateFavorites,
    updateHistory
  } = useMealPlanStorage();
  
  // Use our favorites hook
  const { favorites, toggleFavorite } = useFavoriteRecipes(
    recipes, 
    favoriteIds, 
    updateFavorites
  );
  
  // Use our history hook
  const { previousRecipes, addToHistory } = useRecipeHistory(
    recipes, 
    historyIds, 
    updateHistory
  );

  // Clear a specific recipe from the meal plan
  const clearRecipeFromMealPlan = useCallback((recipeId: string) => {
    if (!recipeId) return;
    
    setMealPlan(prev => {
      return prev.map(dayMeal => {
        if (dayMeal.recipe && dayMeal.recipe.id === recipeId) {
          return { ...dayMeal, recipe: null };
        }
        return dayMeal;
      });
    });
  }, [setMealPlan]);

  // Add a recipe to the meal plan for a specific day
  const addToMealPlan = useCallback((day: string, recipeId: string) => {
    setMealPlan(prev => {
      return prev.map(dayMeal => {
        if (dayMeal.day !== day) return dayMeal;
        
        // If recipeId is empty, we're removing the recipe
        if (!recipeId) {
          return { ...dayMeal, recipe: null };
        }
        
        // Find the recipe by ID
        const recipe = recipes.find(r => r.id === recipeId);
        if (!recipe) return dayMeal;
        
        // Add to history
        addToHistory(recipeId);
        
        return { ...dayMeal, recipe };
      });
    });
  }, [recipes, addToHistory, setMealPlan]);

  // Add a recipe to multiple days at once
  const addToMultipleDays = useCallback((days: string[], recipeId: string) => {
    if (!recipeId || days.length === 0) return;
    
    // Find the recipe by ID
    const recipe = recipes.find(r => r.id === recipeId);
    if (!recipe) return;
    
    // Add to history
    addToHistory(recipeId);
    
    // Update all selected days with the recipe
    setMealPlan(prev => {
      return prev.map(dayMeal => {
        if (days.includes(dayMeal.day)) {
          return { ...dayMeal, recipe };
        }
        return dayMeal;
      });
    });
    
    // Show a toast notification
    toast.success(`Recept tillagt i ${days.length} dagar`);
  }, [recipes, addToHistory, setMealPlan]);

  return { 
    mealPlan, 
    favorites, 
    previousRecipes, 
    loading,
    addToMealPlan,
    addToMultipleDays,
    clearRecipeFromMealPlan,
    toggleFavorite,
    favoriteIds
  };
};
