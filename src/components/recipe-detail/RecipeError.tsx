
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, RefreshCw } from "lucide-react";

interface RecipeErrorProps {
  message?: string;
  onGoBack: () => void;
  onRetry?: () => Promise<boolean>;
}

export const RecipeError: React.FC<RecipeErrorProps> = ({
  message = "Receptet kunde inte hittas.",
  onGoBack,
  onRetry,
}) => {
  const [isRetrying, setIsRetrying] = useState(false);
  const [retryResult, setRetryResult] = useState<string | null>(null);

  const handleRetry = async () => {
    if (!onRetry) return;
    
    setIsRetrying(true);
    setRetryResult(null);
    
    try {
      const success = await onRetry();
      
      if (success) {
        setRetryResult("Receptet har uppdaterats! Laddar om...");
        // Success message will show briefly before the page reloads with the recipe
      } else {
        setRetryResult("Kunde inte uppdatera receptet. Vänligen försök igen senare.");
      }
    } catch (error) {
      console.error("Error during retry:", error);
      setRetryResult("Ett fel uppstod. Vänligen försök igen senare.");
    } finally {
      setIsRetrying(false);
    }
  };

  return (
    <div className="min-h-screen bg-white pb-20 flex flex-col items-center justify-center px-4">
      <h2 className="text-xl font-semibold mb-4">Kunde inte ladda receptet</h2>
      <p className="text-gray-500 mb-6 text-center">{message}</p>
      
      {retryResult && (
        <div className={`p-3 rounded mb-6 text-center ${retryResult.includes("uppdaterats") ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>
          {retryResult}
        </div>
      )}
      
      <div className="flex flex-col sm:flex-row gap-3">
        <Button onClick={onGoBack} variant="outline">
          <ArrowLeft className="mr-2" size={16} />
          Tillbaka
        </Button>
        
        {onRetry && (
          <Button 
            onClick={handleRetry} 
            variant="default"
            disabled={isRetrying}
          >
            <RefreshCw className={`mr-2 ${isRetrying ? "animate-spin" : ""}`} size={16} />
            {isRetrying ? "Uppdaterar..." : "Uppdatera recept"}
          </Button>
        )}
      </div>
    </div>
  );
};
