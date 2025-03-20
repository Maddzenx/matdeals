
import React, { useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { DayMeal } from "@/types/mealPlan";
import { Recipe } from "@/types/recipe";
import { Check } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";

interface DaySelectorProps {
  mealPlan: DayMeal[];
  recipe: Recipe | {id: string}; // Allow minimal recipe data with just ID
  onSelectDay: (day: string, recipeId: string) => void;
  onSelectMultipleDays?: (days: string[], recipeId: string) => void;
  trigger?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  allowMultiple?: boolean;
}

export const DaySelector: React.FC<DaySelectorProps> = ({ 
  mealPlan, 
  recipe, 
  onSelectDay,
  onSelectMultipleDays,
  trigger,
  open,
  onOpenChange,
  allowMultiple = false
}) => {
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [selectedDays, setSelectedDays] = useState<string[]>([]);
  const [internalOpen, setInternalOpen] = useState(false);
  
  const isControlled = open !== undefined && onOpenChange !== undefined;
  const isOpen = isControlled ? open : internalOpen;
  
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
    if (allowMultiple) {
      setSelectedDays(prev => {
        if (prev.includes(day)) {
          return prev.filter(d => d !== day);
        } else {
          return [...prev, day];
        }
      });
    } else {
      setSelectedDay(day);
    }
  };

  const handleConfirm = () => {
    if (allowMultiple && selectedDays.length > 0 && onSelectMultipleDays) {
      onSelectMultipleDays(selectedDays, recipe.id);
      
      // Update open state based on whether component is controlled or not
      if (isControlled) {
        onOpenChange(false);
      } else {
        setInternalOpen(false);
      }
    } else if (selectedDay) {
      onSelectDay(selectedDay, recipe.id);
      
      // Update open state based on whether component is controlled or not
      if (isControlled) {
        onOpenChange(false);
      } else {
        setInternalOpen(false);
      }
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    // Update open state based on whether component is controlled or not
    if (isControlled) {
      onOpenChange(newOpen);
    } else {
      setInternalOpen(newOpen);
    }
    
    if (!newOpen) {
      // Reset selected day when closing
      setSelectedDay(null);
      setSelectedDays([]);
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={handleOpenChange}>
      <SheetTrigger asChild onClick={(e) => {
        // Prevent default and stop propagation to avoid triggering other click handlers
        if (e) {
          e.preventDefault();
          e.stopPropagation();
        }
      }}>
        {trigger || <Button onClick={(e) => e.stopPropagation()}>Välj dag</Button>}
      </SheetTrigger>
      <SheetContent side="bottom" className="rounded-t-lg z-[100] p-6 bg-[#1A1F2C]">
        <SheetHeader className="mb-6">
          <SheetTitle className="text-left text-xl font-bold text-white">
            {allowMultiple ? "Välj dagar för receptet" : "Välj dag för receptet"}
          </SheetTitle>
        </SheetHeader>
        <div className="grid gap-3 py-2">
          {mealPlan.map((day) => (
            <button
              key={day.day}
              onClick={() => handleSelectDay(day.day)}
              className={`w-full p-4 text-left rounded-md flex items-center justify-between
                ${allowMultiple 
                  ? "bg-[#2c3446] text-white hover:bg-[#3a445c]" 
                  : selectedDay === day.day 
                    ? "bg-[#DB2C17] text-white" 
                    : "bg-[#2c3446] text-white hover:bg-[#3a445c]"}`}
            >
              <div className="flex items-center">
                {allowMultiple && (
                  <div className="mr-3">
                    <Checkbox 
                      id={`day-${day.day}`} 
                      checked={selectedDays.includes(day.day)}
                      className="h-5 w-5 border-white data-[state=checked]:bg-[#DB2C17] data-[state=checked]:border-[#DB2C17]"
                      onClick={(e) => e.stopPropagation()}
                      onCheckedChange={() => handleSelectDay(day.day)}
                    />
                  </div>
                )}
                <span className="font-medium">{getDayName(day.day)}</span>
              </div>
              {day.recipe && (
                <span className="text-sm opacity-80">
                  {(allowMultiple && selectedDays.includes(day.day)) || selectedDay === day.day 
                    ? "(ersätter)" 
                    : "(upptagen)"}
                </span>
              )}
              {!allowMultiple && selectedDay === day.day && <Check size={18} />}
            </button>
          ))}
        </div>
        <div className="mt-6 flex justify-end gap-3">
          <Button variant="outline" onClick={() => handleOpenChange(false)}
            className="bg-[#2c3446] hover:bg-[#3a445c] text-white border-[#3a445c]">
            Avbryt
          </Button>
          <Button 
            className="bg-[#DB2C17] hover:bg-[#c02615] text-white"
            onClick={handleConfirm}
            disabled={allowMultiple ? selectedDays.length === 0 : !selectedDay}
          >
            Bekräfta
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
};
