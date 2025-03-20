
import React from "react";
import { Button } from "@/components/ui/button";
import { Heart, CalendarPlus, ShoppingCart } from "lucide-react";
import { DaySelector } from "@/components/meal-plan/DaySelector";
import { DayMeal } from "@/types/mealPlan";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

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
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation(); // Stop event from bubbling up to the card
    onAddToCart(e);
    
    // Show toast notification
    toast({
      title: "Varor tillagda",
      description: "Ingredienserna lades till i inköpslistan",
    });
  };

  const handleFavoriteToggle = (e: React.MouseEvent) => {
    e.stopPropagation(); // Stop event from bubbling up to the card
    onFavoriteToggle(e);
  };

  return (
    <div className="flex gap-1" onClick={e => e.stopPropagation()}>
      <Button
        variant="ghost"
        size="icon"
        className="w-9 h-9 rounded-full"
        onClick={handleFavoriteToggle}
        aria-label={isFavorite ? "Ta bort från favoriter" : "Lägg till i favoriter"}
      >
        <Heart size={18} className={isFavorite ? "text-[#DB2C17] fill-[#DB2C17]" : ""} />
      </Button>
      
      <DaySelector
        mealPlan={mealPlan || []}
        recipe={{id: recipeId}}
        onSelectDay={onSelectDay || ((day: string, recipeId: string) => {
          navigate("/meal-plan");
        })}
        trigger={
          <Button 
            variant="ghost"
            size="icon"
            className="w-9 h-9 rounded-full"
            aria-label="Lägg till i matsedel"
            onClick={e => e.stopPropagation()} // Stop propagation on the trigger button
          >
            <CalendarPlus size={18} />
          </Button>
        }
      />
      
      <Button 
        className="bg-[#DB2C17] hover:bg-[#c02615] w-9 h-9 rounded-full"
        onClick={handleAddToCart}
        size="icon"
        aria-label="Lägg till varor i inköpslistan"
      >
        <ShoppingCart size={18} />
      </Button>
    </div>
  );
};
