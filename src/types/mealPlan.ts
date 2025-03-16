
import { Recipe } from "./recipe";

export interface DayMeal {
  day: string;
  recipe: Recipe | null;
}

export interface MealPlanState {
  meals: DayMeal[];
  favorites: string[]; // Array of recipe IDs
  history: string[]; // Array of recipe IDs
}
