
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, ChevronRight } from "lucide-react";
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

  const isCurrentDay = () => {
    const today = new Date().toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
    return today === day.day.toLowerCase();
  };

  return (
    <Card className={`overflow-hidden transition-all duration-200 ${isCurrentDay() ? 'border-[#DB2C17] shadow-md' : 'border-gray-200'}`}>
      <div className={`py-3 px-4 border-b ${isCurrentDay() ? 'bg-[#FEF3F2] text-[#DB2C17]' : 'bg-gray-50'}`}>
        <h3 className="font-medium">{getDayName(day.day)}</h3>
      </div>
      <CardContent className="p-4">
        {day.recipe ? (
          <div className="flex items-center">
            <div 
              className="h-20 w-20 bg-gray-100 rounded-md overflow-hidden mr-4 cursor-pointer shadow-sm transition-transform hover:scale-105"
              onClick={() => navigate(`/recipe/${day.recipe.id}`)}
            >
              {day.recipe.image_url && (
                <img 
                  src={day.recipe.image_url} 
                  alt={day.recipe.title} 
                  className="h-full w-full object-cover"
                />
              )}
            </div>
            <div className="flex-1 cursor-pointer" onClick={() => navigate(`/recipe/${day.recipe.id}`)}>
              <h4 className="font-medium text-sm hover:text-[#DB2C17] transition-colors">
                {day.recipe.title}
              </h4>
              <p className="text-xs text-gray-500 mt-1">
                {day.recipe.time_minutes} min • {day.recipe.servings} portioner
              </p>
              <div className="flex items-center mt-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 px-2 text-xs text-[#DB2C17] hover:text-[#c02615] hover:bg-[#FEF3F2]"
                  onClick={(e) => {
                    e.stopPropagation();
                    onAddRecipe("");
                  }}
                >
                  Byt recept
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 px-2 text-xs flex items-center gap-1"
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/recipe/${day.recipe.id}`);
                  }}
                >
                  Se detaljer <ChevronRight size={14} />
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div 
            className="flex flex-col items-center justify-center h-24 border-2 border-dashed border-gray-200 rounded-md cursor-pointer hover:border-[#DB2C17] transition-colors bg-gray-50 hover:bg-[#FEF3F2]/30"
            onClick={() => navigate("/recipes")}
          >
            <div className="flex flex-col items-center">
              <div className="w-8 h-8 rounded-full bg-[#FEF3F2] flex items-center justify-center mb-2">
                <Plus size={18} className="text-[#DB2C17]" />
              </div>
              <span className="text-sm text-gray-500">Lägg till recept</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

