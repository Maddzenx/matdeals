
import React from "react";
import { Button } from "@/components/ui/button";
import { Heart, CalendarPlus, ShoppingCart } from "lucide-react";

interface RecipeCardActionsProps {
  isFavorite: boolean;
  onFavoriteToggle: (e: React.MouseEvent) => void;
  onAddToMealPlan: (e: React.MouseEvent) => void;
  onAddToCart: (e: React.MouseEvent) => void;
}

export const RecipeCardActions: React.FC<RecipeCardActionsProps> = ({
  isFavorite,
  onFavoriteToggle,
  onAddToMealPlan,
  onAddToCart,
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
      <Button 
        variant="ghost"
        size="icon"
        className="w-9 h-9 rounded-full"
        onClick={onAddToMealPlan}
        aria-label="Add to meal plan"
      >
        <CalendarPlus size={18} />
      </Button>
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
