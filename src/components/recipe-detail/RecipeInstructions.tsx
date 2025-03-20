
import React, { useState, useEffect } from "react";
import { Lightbulb } from "lucide-react";
import { Switch } from "@/components/ui/switch";

interface RecipeInstructionsProps {
  instructions: string[] | null;
}

export const RecipeInstructions: React.FC<RecipeInstructionsProps> = ({
  instructions,
}) => {
  const [keepScreenOn, setKeepScreenOn] = useState(false);

  useEffect(() => {
    // Only run this effect when the toggle is switched
    if (keepScreenOn) {
      let wakeLockSentinel: WakeLockSentinel | null = null;
      
      // Request wake lock to prevent screen from turning off
      const requestWakeLock = async () => {
        try {
          // The Wake Lock API is used to prevent the screen from turning off
          wakeLockSentinel = await navigator.wakeLock.request("screen");
        } catch (err) {
          console.error(`Failed to keep screen on: ${err}`);
          
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
  }, [keepScreenOn]);

  const handleToggleScreenOn = (checked: boolean) => {
    setKeepScreenOn(checked);
  };

  if (!instructions || instructions.length === 0) {
    return null;
  }

  return (
    <div className="mb-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Instruktioner</h2>
        <div className="flex items-center gap-2">
          <span className="text-sm">Håll skärmen tänd</span>
          <Switch 
            checked={keepScreenOn}
            onCheckedChange={handleToggleScreenOn}
            className="data-[state=checked]:bg-[#DB2C17]"
          />
        </div>
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
