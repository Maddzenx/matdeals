
import React from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

interface RecipeErrorProps {
  message?: string;
  onGoBack: () => void;
}

export const RecipeError: React.FC<RecipeErrorProps> = ({
  message = "Receptet kunde inte hittas.",
  onGoBack,
}) => {
  return (
    <div className="min-h-screen bg-white pb-20 flex flex-col items-center justify-center px-4">
      <h2 className="text-xl font-semibold mb-4">Kunde inte ladda receptet</h2>
      <p className="text-gray-500 mb-6">{message}</p>
      <Button onClick={onGoBack}>
        <ArrowLeft className="mr-2" size={16} />
        Tillbaka
      </Button>
    </div>
  );
};
