
import React from "react";
import { Button } from "@/components/ui/button";
import { Heart, CalendarPlus, ShoppingCart } from "lucide-react";
import { DaySelector } from "@/components/meal-plan/DaySelector";
import { DayMeal } from "@/types/mealPlan";

interface RecipeCardActionsProps {
  isFavorite: boolean;
  onFavoriteToggle: (e: React.MouseEvent) => void;
  onAddToMealPlan: (e: React.MouseEvent) => void;
  onAddToCart: (e: React.MouseEvent) => void;
  recipeId: string;
  mealPlan?: DayMeal[];
  onSelectDay?: (day: string, recipeId: string) => void;
}

export const RecipeCardActions: React.FC<RecipeCardActionsProps> = ({
  isFavorite,
  onFavoriteToggle,
  onAddToMealPlan,
  onAddToCart,
  recipeId,
  mealPlan,
  onSelectDay,
}) => {
  return (
    <div className="flex gap-1">
      <Button
        variant="ghost"
        size="icon"
        className="w-9 h-9 rounded-full"
        onClick={onFavoriteToggle}
        aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
      >
        <Heart size={18} className={isFavorite ? "text-[#DB2C17] fill-[#DB2C17]" : ""} />
      </Button>
      
      {mealPlan && onSelectDay ? (
        <DaySelector
          mealPlan={mealPlan}
          recipe={{id: recipeId}}
          onSelectDay={onSelectDay}
          trigger={
            <Button 
              variant="ghost"
              size="icon"
              className="w-9 h-9 rounded-full"
              aria-label="Add to meal plan"
            >
              <CalendarPlus size={18} />
            </Button>
          }
        />
      ) : (
        <Button 
          variant="ghost"
          size="icon"
          className="w-9 h-9 rounded-full"
          onClick={onAddToMealPlan}
          aria-label="Add to meal plan"
        >
          <CalendarPlus size={18} />
        </Button>
      )}
      
      <Button 
        className="bg-[#DB2C17] hover:bg-[#c02615] w-9 h-9 rounded-full"
        onClick={onAddToCart}
        size="icon"
        aria-label="Add ingredients to cart"
      >
        <ShoppingCart size={18} />
      </Button>
    </div>
  );
};
