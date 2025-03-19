
import React from "react";
import { ArrowLeft, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Recipe } from "@/hooks/useRecipes";

interface RecipeHeaderProps {
  recipe: Recipe;
  onBack: () => void;
  onRefresh: () => void;
  showRefreshButton?: boolean;
}

export const RecipeHeader: React.FC<RecipeHeaderProps> = ({
  recipe,
  onBack,
  onRefresh,
  showRefreshButton = false,
}) => {
  // Function to handle image errors
  const imageUrl = recipe.image_url || 'https://images.unsplash.com/photo-1495521821757-a1efb6729352?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80';
  
  return (
    <div className="relative">
      <div 
        className="h-64 bg-gray-200 bg-center bg-cover"
        style={{
          backgroundImage: `url(${imageUrl})`,
        }}
      >
        <div className="absolute top-0 left-0 right-0 bg-gradient-to-b from-black/60 to-transparent p-4">
          <button onClick={onBack} className="flex items-center text-white">
            <ArrowLeft size={20} className="mr-1" />
            <span>Tillbaka</span>
          </button>
        </div>
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4">
          <h1 className="text-2xl font-bold text-white">{recipe.title}</h1>
        </div>
      </div>
      
      {showRefreshButton && (
        <div className="absolute top-4 right-4">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={onRefresh} 
            className="bg-white/80 hover:bg-white"
          >
            <RefreshCw size={16} className="mr-1" />
            Uppdatera detaljer
          </Button>
        </div>
      )}
    </div>
  );
};
