
import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { DayMeal } from "@/types/mealPlan";
import { Recipe } from "@/types/recipe";

interface DaySelectorProps {
  mealPlan: DayMeal[];
  recipe: Recipe;
  onSelectDay: (day: string, recipeId: string) => void;
  trigger?: React.ReactNode;
}

export const DaySelector: React.FC<DaySelectorProps> = ({ 
  mealPlan, 
  recipe, 
  onSelectDay,
  trigger
}) => {
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
    <Dialog>
      <DialogTrigger asChild>
        {trigger || <Button>Välj dag</Button>}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Välj dag för receptet</DialogTitle>
        </DialogHeader>
        <div className="grid gap-3 py-4">
          {mealPlan.map((day) => (
            <Button
              key={day.day}
              variant={day.recipe ? "outline" : "default"}
              className="w-full justify-start"
              onClick={() => onSelectDay(day.day, recipe.id)}
            >
              {getDayName(day.day)}
              {day.recipe && (
                <span className="ml-2 text-xs text-gray-500">
                  (ersätter: {day.recipe.title})
                </span>
              )}
            </Button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
};
