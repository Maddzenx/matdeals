
import { useState, useEffect, useCallback } from "react";
import { DayMeal, MealPlanState } from "@/types/mealPlan";
import { initializeMealPlan, MEAL_PLAN_STORAGE_KEY } from "@/utils/mealPlanUtils";

export const useMealPlanStorage = () => {
  const [mealPlan, setMealPlan] = useState<DayMeal[]>(initializeMealPlan());
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);
  const [historyIds, setHistoryIds] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Load meal plan from localStorage
  useEffect(() => {
    const loadMealPlan = () => {
      try {
        const storedData = localStorage.getItem(MEAL_PLAN_STORAGE_KEY);
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
    setLoading(false);
  }, []);

  // Save meal plan to localStorage
  const saveMealPlan = useCallback(() => {
    try {
      const dataToSave: MealPlanState = {
        meals: mealPlan,
        favorites: favoriteIds,
        history: historyIds
      };
      
      localStorage.setItem(MEAL_PLAN_STORAGE_KEY, JSON.stringify(dataToSave));
    } catch (error) {
      console.error("Error saving meal plan:", error);
    }
  }, [mealPlan, favoriteIds, historyIds]);

  // Save to localStorage whenever data changes
  useEffect(() => {
    if (!loading) {
      saveMealPlan();
    }
  }, [mealPlan, favoriteIds, historyIds, loading, saveMealPlan]);

  // Update favoriteIds in storage
  const updateFavorites = useCallback((newFavoriteIds: string[]) => {
    setFavoriteIds(newFavoriteIds);
  }, []);

  // Update historyIds in storage
  const updateHistory = useCallback((newHistoryIds: string[]) => {
    setHistoryIds(newHistoryIds);
  }, []);

  return { 
    mealPlan, 
    setMealPlan,
    favoriteIds, 
    historyIds,
    loading,
    updateFavorites,
    updateHistory
  };
};
