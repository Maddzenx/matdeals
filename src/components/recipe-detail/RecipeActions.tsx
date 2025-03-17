
import React from "react";
import { Button } from "@/components/ui/button";
import { Heart } from "lucide-react";
import { Recipe } from "@/types/recipe";
import { DaySelector } from "@/components/meal-plan/DaySelector";
import { DayMeal } from "@/types/mealPlan";

interface RecipeActionsProps {
  recipe: Recipe;
  favoriteIds: string[];
  mealPlan: DayMeal[];
  onFavoriteToggle: () => void;
  onAddToMealPlan: (day: string, recipeId: string) => void;
}

export const RecipeActions: React.FC<RecipeActionsProps> = ({
  recipe,
  favoriteIds,
  mealPlan,
  onFavoriteToggle,
  onAddToMealPlan,
}) => {
  return (
    <div className="px-4 mb-4 flex justify-between">
      <Button 
        variant="outline" 
        size="sm" 
        className="flex items-center gap-1"
        onClick={onFavoriteToggle}
      >
        <Heart size={16} className={favoriteIds.includes(recipe.id) ? "text-[#DB2C17] fill-[#DB2C17]" : ""} />
        {favoriteIds.includes(recipe.id) ? "Ta bort favorit" : "Spara som favorit"}
      </Button>
      
      <DaySelector
        mealPlan={mealPlan}
        recipe={recipe}
        onSelectDay={onAddToMealPlan}
        trigger={
          <Button variant="outline" size="sm">
            Lägg till i matsedel
          </Button>
        }
      />
    </div>
  );
};
