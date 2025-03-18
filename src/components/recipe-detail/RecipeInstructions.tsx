
import React, { useState, useEffect } from "react";
import { Toggle } from "@/components/ui/toggle";
import { Lightbulb } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface RecipeInstructionsProps {
  instructions: string[] | null;
}

export const RecipeInstructions: React.FC<RecipeInstructionsProps> = ({
  instructions,
}) => {
  const [keepScreenOn, setKeepScreenOn] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Only run this effect when the toggle is switched
    if (keepScreenOn) {
      let wakeLockSentinel: WakeLockSentinel | null = null;
      
      // Request wake lock to prevent screen from turning off
      const requestWakeLock = async () => {
        try {
          // The Wake Lock API is used to prevent the screen from turning off
          wakeLockSentinel = await navigator.wakeLock.request("screen");
          
          toast({
            title: "Skärmen hålls tänd",
            description: "Skärmen kommer att förbli tänd medan du lagar mat",
          });
        } catch (err) {
          console.error(`Failed to keep screen on: ${err}`);
          
          toast({
            title: "Kunde inte hålla skärmen tänd",
            description: "Din enhet stödjer eventuellt inte denna funktion",
            variant: "destructive",
          });
          
          // Reset the toggle if we couldn't get a wake lock
          setKeepScreenOn(false);
        }
      };

      // Execute the wake lock request
      requestWakeLock();
      
      // Clean up function
      return () => {
        if (wakeLockSentinel) {
          wakeLockSentinel.release().then(() => {
            console.log("Wake Lock released");
          }).catch(error => {
            console.error("Error releasing wake lock:", error);
          });
        }
      };
    }
  }, [keepScreenOn, toast]);

  const handleToggleScreenOn = () => {
    setKeepScreenOn(!keepScreenOn);
    
    // If we're turning it off, show a toast
    if (keepScreenOn) {
      toast({
        title: "Skärmen kommer att släckas som vanligt",
        description: "Automatisk skärmsläckning är aktiverad igen",
      });
    }
  };

  if (!instructions || instructions.length === 0) {
    return null;
  }

  return (
    <div className="mb-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Instruktioner</h2>
        <Toggle 
          pressed={keepScreenOn}
          onPressedChange={handleToggleScreenOn}
          aria-label="Håll skärmen tänd"
          className="data-[state=on]:bg-[#DB2C17] data-[state=on]:text-white"
        >
          <Lightbulb size={18} className="mr-2" />
          Håll skärmen tänd
        </Toggle>
      </div>
      
      <ol className="space-y-4">
        {instructions.map((step, idx) => (
          <li key={idx} className="flex">
            <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-[#DB2C17] text-white font-medium text-sm mr-3 flex-shrink-0">
              {idx + 1}
            </span>
            <span className="text-gray-700">{step}</span>
          </li>
        ))}
      </ol>
    </div>
  );
};
