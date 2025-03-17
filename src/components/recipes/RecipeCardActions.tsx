
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
    <div className="flex gap-2">
      <Button
        variant="outline"
        size="sm"
        className="flex items-center gap-1"
        onClick={onFavoriteToggle}
      >
        <Heart size={16} className={isFavorite ? "text-[#DB2C17] fill-[#DB2C17]" : ""} />
        {isFavorite ? "Favorit" : "Favorit"}
      </Button>
      <Button 
        variant="outline"
        size="sm"
        className="flex items-center gap-1"
        onClick={onAddToMealPlan}
      >
        <CalendarPlus size={16} />
        Matsedel
      </Button>
      <Button 
        className="bg-[#DB2C17] hover:bg-[#c02615] flex items-center gap-1"
        onClick={onAddToCart}
        size="sm"
      >
        <ShoppingCart size={16} />
        Lägg till
      </Button>
    </div>
  );
};
