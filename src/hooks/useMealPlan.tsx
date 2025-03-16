
import { useState, useEffect, useCallback } from "react";
import { Recipe } from "@/types/recipe";
import { DayMeal, MealPlanState } from "@/types/mealPlan";
import { useRecipes } from "@/hooks/useRecipes";

// Helper to get days of the week
const getWeekDays = (): string[] => {
  return ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
};

// Initialize empty meal plan with days of the week
const initializeMealPlan = (): DayMeal[] => {
  return getWeekDays().map(day => ({
    day,
    recipe: null
  }));
};

// Default local storage key
const STORAGE_KEY = 'matsedel_meal_plan';

export const useMealPlan = () => {
  const [mealPlan, setMealPlan] = useState<DayMeal[]>(initializeMealPlan());
  const [favorites, setFavorites] = useState<Recipe[]>([]);
  const [previousRecipes, setPreviousRecipes] = useState<Recipe[]>([]);
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);
  const [historyIds, setHistoryIds] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  
  const { recipes } = useRecipes();

  // Load meal plan from localStorage
  useEffect(() => {
    const loadMealPlan = () => {
      try {
        const storedData = localStorage.getItem(STORAGE_KEY);
        if (storedData) {
          const data: MealPlanState = JSON.parse(storedData);
          
          // Initialize with empty days if stored data doesn't have enough
          const fullMealPlan = initializeMealPlan();
          
          // Update with stored recipe connections
          data.meals.forEach(meal => {
            const dayIndex = fullMealPlan.findIndex(d => d.day === meal.day);
            if (dayIndex >= 0 && meal.recipe) {
              fullMealPlan[dayIndex].recipe = meal.recipe;
            }
          });
          
          setMealPlan(fullMealPlan);
          setFavoriteIds(data.favorites || []);
          setHistoryIds(data.history || []);
        }
      } catch (error) {
        console.error("Error loading meal plan:", error);
      }
    };
    
    loadMealPlan();
  }, []);

  // Update recipes when recipe data is loaded
  useEffect(() => {
    if (recipes.length > 0) {
      // Update recipe data in meal plan with latest from recipes
      const updatedMealPlan = mealPlan.map(day => {
        if (!day.recipe) return day;
        
        const updatedRecipe = recipes.find(r => r.id === day.recipe?.id);
        return {
          ...day,
          recipe: updatedRecipe || day.recipe
        };
      });
      
      // Update favorites and history with latest recipe data
      const updatedFavorites = recipes.filter(recipe => 
        favoriteIds.includes(recipe.id)
      );
      
      const updatedHistory = recipes.filter(recipe => 
        historyIds.includes(recipe.id)
      );
      
      setMealPlan(updatedMealPlan);
      setFavorites(updatedFavorites);
      setPreviousRecipes(updatedHistory);
      setLoading(false);
    }
  }, [recipes, favoriteIds, historyIds]);

  // Save meal plan to localStorage whenever it changes
  useEffect(() => {
    const saveMealPlan = () => {
      try {
        const dataToSave: MealPlanState = {
          meals: mealPlan,
          favorites: favoriteIds,
          history: historyIds
        };
        
        localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToSave));
      } catch (error) {
        console.error("Error saving meal plan:", error);
      }
    };
    
    if (!loading) {
      saveMealPlan();
    }
  }, [mealPlan, favoriteIds, historyIds, loading]);

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
        
        // Add to history if not already present
        if (!historyIds.includes(recipeId)) {
          setHistoryIds(prev => [...prev, recipeId]);
        }
        
        return { ...dayMeal, recipe };
      });
    });
  }, [recipes, historyIds]);

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

  return { 
    mealPlan, 
    favorites, 
    previousRecipes, 
    loading,
    addToMealPlan,
    toggleFavorite
  };
};
