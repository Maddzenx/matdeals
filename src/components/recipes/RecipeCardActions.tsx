
import React from "react";
import { Button } from "@/components/ui/button";
import { Heart, CalendarPlus, ShoppingCart } from "lucide-react";
import { DaySelector } from "@/components/meal-plan/DaySelector";
import { DayMeal } from "@/types/mealPlan";
import { useToast } from "@/hooks/use-toast";

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
  
  const handleAddToCart = (e: React.MouseEvent) => {
    onAddToCart(e);
    
    // Show toast notification
    toast({
      title: "Varor tillagda",
      description: "Ingredienserna lades till i inköpslistan",
    });
  };

  return (
    <div className="flex gap-1">
      <Button
        variant="ghost"
        size="icon"
        className="w-9 h-9 rounded-full"
        onClick={onFavoriteToggle}
        aria-label={isFavorite ? "Ta bort från favoriter" : "Lägg till i favoriter"}
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
              aria-label="Lägg till i matsedel"
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
          aria-label="Lägg till i matsedel"
        >
          <CalendarPlus size={18} />
        </Button>
      )}
      
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
