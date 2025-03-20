
import React, { useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { DayMeal } from "@/types/mealPlan";
import { Recipe } from "@/types/recipe";
import { Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface DaySelectorProps {
  mealPlan: DayMeal[];
  recipe: Recipe | {id: string}; // Allow minimal recipe data with just ID
  onSelectDay: (day: string, recipeId: string) => void;
  trigger?: React.ReactNode;
}

export const DaySelector: React.FC<DaySelectorProps> = ({ 
  mealPlan, 
  recipe, 
  onSelectDay,
  trigger
}) => {
  const { toast } = useToast();
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  
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

  const handleSelectDay = (day: string) => {
    setSelectedDay(day);
  };

  const handleConfirm = () => {
    if (selectedDay) {
      onSelectDay(selectedDay, recipe.id);
      setOpen(false);
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (!newOpen) {
      // Reset selected day when closing
      setSelectedDay(null);
    }
  };

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetTrigger asChild onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
      }}>
        {trigger || <Button onClick={(e) => e.stopPropagation()}>Välj dag</Button>}
      </SheetTrigger>
      <SheetContent side="bottom" className="rounded-t-lg z-[1000] p-6 bg-white">
        <SheetHeader className="mb-6">
          <SheetTitle className="text-left text-xl font-bold">Välj dag för receptet</SheetTitle>
        </SheetHeader>
        <div className="grid gap-3 py-2">
          {mealPlan.map((day) => (
            <button
              key={day.day}
              onClick={() => handleSelectDay(day.day)}
              className={`w-full p-4 text-left rounded-md flex items-center justify-between 
                ${selectedDay === day.day 
                  ? "bg-[#1A1F2C] text-white" 
                  : "bg-[#1A1F2C] text-white hover:bg-[#2c3446]"}`}
            >
              <span className="font-medium">{getDayName(day.day)}</span>
              {day.recipe && (
                <span className="text-sm opacity-80">
                  {selectedDay === day.day ? "(ersätter)" : "(upptagen)"}
                </span>
              )}
              {selectedDay === day.day && <Check size={18} />}
            </button>
          ))}
        </div>
        <div className="mt-6 flex justify-end gap-3">
          <Button variant="outline" onClick={() => setOpen(false)}
            className="bg-white hover:bg-gray-50 border-gray-200">
            Avbryt
          </Button>
          <Button 
            className="bg-[#DB2C17] hover:bg-[#c02615] text-white"
            onClick={handleConfirm}
            disabled={!selectedDay}
          >
            Bekräfta
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
};
