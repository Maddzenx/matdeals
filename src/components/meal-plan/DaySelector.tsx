
import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { DayMeal } from "@/types/mealPlan";
import { Recipe } from "@/types/recipe";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
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
  const [selectedDay, setSelectedDay] = React.useState<string | null>(null);
  const [open, setOpen] = React.useState(false);
  
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
      
      // Show success toast
      toast({
        title: "Receptet lades till",
        description: `Receptet lades till i matsedeln för ${getDayName(selectedDay)}`,
      });
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
      <SheetTrigger asChild>
        {trigger || <Button>Välj dag</Button>}
      </SheetTrigger>
      <SheetContent side="bottom" className="rounded-t-lg">
        <SheetHeader className="mb-4">
          <SheetTitle>Välj dag för receptet</SheetTitle>
        </SheetHeader>
        <div className="grid gap-3 py-2">
          {mealPlan.map((day) => (
            <Button
              key={day.day}
              variant={selectedDay === day.day ? "default" : "outline"}
              className={`w-full justify-between ${selectedDay === day.day ? "bg-[#DB2C17] hover:bg-[#c02615]" : ""}`}
              onClick={() => handleSelectDay(day.day)}
            >
              <span>{getDayName(day.day)}</span>
              {day.recipe && (
                <span className="text-xs">
                  {selectedDay === day.day ? "(ersätter)" : "(upptagen)"}
                </span>
              )}
              {selectedDay === day.day && <Check size={18} />}
            </Button>
          ))}
        </div>
        <div className="mt-6 flex justify-end gap-3">
          <Button variant="outline" onClick={() => setOpen(false)}>
            Avbryt
          </Button>
          <Button 
            className="bg-[#DB2C17] hover:bg-[#c02615]"
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
