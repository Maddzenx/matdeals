
import React from "react";
import { MealPlanDay } from "./MealPlanDay";
import { LoadingIndicator } from "@/components/LoadingIndicator";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { DayMeal } from "@/types/mealPlan";

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

  if (loading) {
    return <LoadingIndicator message="Laddar matsedel..." />;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">Veckans matsedel</h2>
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => navigate("/recipes")}
        >
          Hitta recept
        </Button>
      </div>

      {mealPlan.map((day) => (
        <MealPlanDay 
          key={day.day} 
          day={day} 
          onAddRecipe={(recipeId) => onAddRecipe(day.day, recipeId)}
        />
      ))}
    </div>
  );
};
