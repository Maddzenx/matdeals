
import React from "react";
import { MealPlanDay } from "./MealPlanDay";
import { LoadingIndicator } from "@/components/LoadingIndicator";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { DayMeal } from "@/types/mealPlan";
import { Utensils, CalendarClock } from "lucide-react";

interface WeeklyPlanViewProps {
  mealPlan: DayMeal[];
  loading: boolean;
  onAddRecipe: (day: string, recipeId: string) => void;
}

export const WeeklyPlanView: React.FC<WeeklyPlanViewProps> = ({ 
  mealPlan, 
  loading,
  onAddRecipe
}) => {
  const navigate = useNavigate();
  const filledDaysCount = mealPlan.filter(day => day.recipe !== null).length;
  const progressPercentage = Math.round((filledDaysCount / mealPlan.length) * 100);

  if (loading) {
    return <LoadingIndicator message="Laddar matsedel..." />;
  }

  return (
    <div className="space-y-4">
      <div className="sticky top-0 z-10 bg-white pt-2 pb-3 mb-4 border-b border-gray-100">
        <div className="flex justify-between items-center mb-3">
          <div className="flex items-center">
            <CalendarClock size={18} className="text-gray-500 mr-2" />
            <h2 className="text-lg font-semibold">Veckans plan</h2>
          </div>
          <Button 
            variant="outline" 
            size="sm"
            className="h-9 gap-1 bg-white shadow-sm border-gray-200 hover:bg-gray-50"
            onClick={() => navigate("/recipes")}
          >
            <Utensils size={14} />
            Hitta recept
          </Button>
        </div>
        
        {/* Progress bar */}
        <div className="w-full bg-gray-100 rounded-full h-2.5 mb-1">
          <div 
            className="bg-[#DB2C17] h-2.5 rounded-full transition-all duration-500" 
            style={{ width: `${progressPercentage}%` }}
          ></div>
        </div>
        <div className="flex justify-between text-xs text-gray-500">
          <span>{filledDaysCount} av 7 måltider planerade</span>
          <span>{progressPercentage}% klart</span>
        </div>
      </div>

      <div className="grid gap-4">
        {mealPlan.map((day) => (
          <MealPlanDay 
            key={day.day} 
            day={day} 
            onAddRecipe={(recipeId) => onAddRecipe(day.day, recipeId)}
          />
        ))}
      </div>
    </div>
  );
};

