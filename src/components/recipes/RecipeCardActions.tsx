
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Heart, CalendarPlus, ShoppingCart } from "lucide-react";
import { DaySelector } from "@/components/meal-plan/DaySelector";
import { DayMeal } from "@/types/mealPlan";
import { useNavigate } from "react-router-dom";

interface RecipeCardActionsProps {
  isFavorite: boolean;
  onFavoriteToggle: (e: React.MouseEvent) => void;
  onAddToMealPlan: (e: React.MouseEvent) => void;
  onAddToCart: (e: React.MouseEvent) => void;
  recipeId: string;
  mealPlan?: DayMeal[];
  onSelectDay?: (day: string, recipeId: string) => void;
  onSelectMultipleDays?: (days: string[], recipeId: string) => void;
}

export const RecipeCardActions: React.FC<RecipeCardActionsProps> = ({
  isFavorite,
  onFavoriteToggle,
  onAddToMealPlan,
  onAddToCart,
  recipeId,
  mealPlan,
  onSelectDay,
  onSelectMultipleDays,
}) => {
  const navigate = useNavigate();
  const [showMealPlanSelector, setShowMealPlanSelector] = useState(false);
  
  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation(); // Stop event from bubbling up to the card
    onAddToCart(e);
  };

  const handleFavoriteToggle = (e: React.MouseEvent) => {
    e.stopPropagation(); // Stop event from bubbling up to the card
    onFavoriteToggle(e);
  };

  const handleMealPlanClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Stop event from bubbling up to the card
    setShowMealPlanSelector(true);
  };

  return (
    <div className="flex gap-2" onClick={e => e.stopPropagation()}>
      <Button
        variant="ghost"
        size="icon"
        className="w-11 h-11 rounded-full"
        onClick={handleFavoriteToggle}
        aria-label={isFavorite ? "Ta bort från favoriter" : "Lägg till i favoriter"}
      >
        <Heart size={22} className={isFavorite ? "text-[#DB2C17] fill-[#DB2C17]" : ""} />
      </Button>
      
      <Button 
        variant="ghost"
        size="icon"
        className="w-11 h-11 rounded-full"
        aria-label="Lägg till i matsedel"
        onClick={handleMealPlanClick}
      >
        <CalendarPlus size={22} />
      </Button>
      
      <DaySelector
        mealPlan={mealPlan || []}
        recipe={{id: recipeId}}
        onSelectDay={onSelectDay || ((day: string, recipeId: string) => {
          navigate("/meal-plan");
        })}
        onSelectMultipleDays={onSelectMultipleDays}
        allowMultiple={!!onSelectMultipleDays}
        open={showMealPlanSelector}
        onOpenChange={setShowMealPlanSelector}
        trigger={<div className="hidden">Trigger</div>}
      />
      
      <Button 
        className="bg-[#DB2C17] hover:bg-[#c02615] w-11 h-11 rounded-full"
        onClick={handleAddToCart}
        size="icon"
        aria-label="Lägg till varor i inköpslistan"
      >
        <ShoppingCart size={22} />
      </Button>
    </div>
  );
};
