
import React from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, RefreshCw } from "lucide-react";

interface RecipeErrorProps {
  message?: string;
  onGoBack: () => void;
  onRetry?: () => void;
}

export const RecipeError: React.FC<RecipeErrorProps> = ({
  message = "Receptet kunde inte hittas.",
  onGoBack,
  onRetry,
}) => {
  return (
    <div className="min-h-screen bg-white pb-20 flex flex-col items-center justify-center px-4">
      <h2 className="text-xl font-semibold mb-4">Kunde inte ladda receptet</h2>
      <p className="text-gray-500 mb-6 text-center">{message}</p>
      
      <div className="flex flex-col sm:flex-row gap-3">
        <Button onClick={onGoBack} variant="outline">
          <ArrowLeft className="mr-2" size={16} />
          Tillbaka
        </Button>
        
        {onRetry && (
          <Button onClick={onRetry} variant="default">
            <RefreshCw className="mr-2" size={16} />
            Uppdatera recept
          </Button>
        )}
      </div>
    </div>
  );
};
