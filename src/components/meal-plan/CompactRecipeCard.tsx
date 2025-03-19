
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Heart, Clock, Users } from "lucide-react";
import { Recipe } from "@/types/recipe";
import { useNavigate } from "react-router-dom";
import { DaySelector } from "./DaySelector";
import { DayMeal } from "@/types/mealPlan";

interface CompactRecipeCardProps {
  recipe: Recipe;
  isFavorite: boolean;
  onToggleFavorite: () => void;
  onAddToMealPlan: () => void;
  mealPlan?: DayMeal[];
  onSelectDay?: (day: string, recipeId: string) => void;
}

export const CompactRecipeCard: React.FC<CompactRecipeCardProps> = ({
  recipe,
  isFavorite,
  onToggleFavorite,
  onAddToMealPlan,
  mealPlan,
  onSelectDay
}) => {
  const navigate = useNavigate();

  const handleCardClick = () => {
    navigate(`/recipe/${recipe.id}`);
  };

  const handleMealPlanClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigate("/meal-plan");
    onAddToMealPlan();
  };

  // Function to handle image errors
  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    console.log(`Failed to load compact recipe image for ${recipe.title}, using fallback`);
    e.currentTarget.onerror = null; // Prevent infinite loop
    e.currentTarget.src = 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80'; // Food-related fallback
  };

  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow">
      <div className="flex">
        <div 
          className="h-24 w-24 bg-gray-200 cursor-pointer"
          onClick={handleCardClick}
        >
          {recipe.image_url ? (
            <img 
              src={recipe.image_url} 
              alt={recipe.title} 
              className="h-full w-full object-cover"
              onError={handleImageError}
            />
          ) : (
            <div className="h-full w-full flex items-center justify-center bg-gray-100 text-gray-400 text-xs p-2 text-center">
              {recipe.title}
            </div>
          )}
        </div>
        
        <CardContent className="flex-1 p-3">
          <div className="flex justify-between items-start">
            <h3 
              className="font-medium text-sm cursor-pointer hover:text-[#DB2C17]"
              onClick={handleCardClick}
            >
              {recipe.title}
            </h3>
            <button 
              className="text-gray-400 hover:text-[#DB2C17]"
              onClick={(e) => {
                e.stopPropagation();
                onToggleFavorite();
              }}
            >
              <Heart size={16} className={isFavorite ? "text-[#DB2C17] fill-[#DB2C17]" : ""} />
            </button>
          </div>
          
          <div className="flex text-xs text-gray-500 mt-1 space-x-3">
            <span className="flex items-center">
              <Clock size={12} className="mr-1" />
              {recipe.time_minutes} min
            </span>
            <span className="flex items-center">
              <Users size={12} className="mr-1" />
              {recipe.servings} port
            </span>
          </div>
          
          <div className="mt-2 flex justify-end">
            {mealPlan && onSelectDay ? (
              <DaySelector
                mealPlan={mealPlan}
                recipe={recipe}
                onSelectDay={onSelectDay}
                trigger={
                  <Button 
                    size="sm" 
                    variant="outline"
                    className="py-1 h-7 text-xs"
                  >
                    Lägg till i matsedel
                  </Button>
                }
              />
            ) : (
              <Button 
                size="sm" 
                variant="outline"
                className="py-1 h-7 text-xs"
                onClick={handleMealPlanClick}
              >
                Lägg till i matsedel
              </Button>
            )}
          </div>
        </CardContent>
      </div>
    </Card>
  );
};
