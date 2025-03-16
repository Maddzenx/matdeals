
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { DayMeal } from "@/types/mealPlan";

interface MealPlanDayProps {
  day: DayMeal;
  onAddRecipe: (recipeId: string) => void;
}

export const MealPlanDay: React.FC<MealPlanDayProps> = ({ day, onAddRecipe }) => {
  const navigate = useNavigate();
  
  const getDayName = (day: string) => {
    switch(day.toLowerCase()) {
      case 'monday': return 'Måndag';
      case 'tuesday': return 'Tisdag';
      case 'wednesday': return 'Onsdag';
      case 'thursday': return 'Torsdag';
      case 'friday': return 'Fredag';
      case 'saturday': return 'Lördag';
      case 'sunday': return 'Söndag';
      default: return day;
    }
  };

  return (
    <Card className="overflow-hidden">
      <div className="bg-gray-100 py-2 px-4 border-b border-gray-200">
        <h3 className="font-medium">{getDayName(day.day)}</h3>
      </div>
      <CardContent className="p-4">
        {day.recipe ? (
          <div className="flex items-center">
            <div 
              className="h-16 w-16 bg-gray-200 rounded mr-3 cursor-pointer"
              onClick={() => navigate(`/recipe/${day.recipe.id}`)}
            >
              {day.recipe.image_url && (
                <img 
                  src={day.recipe.image_url} 
                  alt={day.recipe.title} 
                  className="h-full w-full object-cover rounded"
                />
              )}
            </div>
            <div className="flex-1" onClick={() => navigate(`/recipe/${day.recipe.id}`)}>
              <h4 className="font-medium text-sm cursor-pointer hover:text-[#DB2C17]">
                {day.recipe.title}
              </h4>
              <p className="text-xs text-gray-500">
                {day.recipe.time_minutes} min • {day.recipe.servings} portioner
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="ml-2"
              onClick={() => onAddRecipe("")} // Passing empty string to remove recipe
            >
              Byt
            </Button>
          </div>
        ) : (
          <div 
            className="flex items-center justify-center h-16 border-2 border-dashed border-gray-300 rounded-md cursor-pointer hover:border-[#DB2C17] transition-colors"
            onClick={() => navigate("/recipes")}
          >
            <div className="flex flex-col items-center">
              <Plus size={20} className="text-gray-400" />
              <span className="text-sm text-gray-500">Lägg till recept</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
