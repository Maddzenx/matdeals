
import { DayMeal } from "@/types/mealPlan";

// Helper to get days of the week
export const getWeekDays = (): string[] => {
  return ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
};

// Initialize empty meal plan with days of the week
export const initializeMealPlan = (): DayMeal[] => {
  return getWeekDays().map(day => ({
    day,
    recipe: null
  }));
};

// Default local storage key
export const MEAL_PLAN_STORAGE_KEY = 'matsedel_meal_plan';
