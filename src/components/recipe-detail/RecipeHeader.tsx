
import React from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, RefreshCw } from "lucide-react";
import { Recipe } from "@/hooks/useRecipes";

interface RecipeHeaderProps {
  recipe: Recipe;
  onBack: () => void;
  onRefresh: () => void;
  showRefreshButton: boolean;
}

export const RecipeHeader: React.FC<RecipeHeaderProps> = ({
  recipe,
  onBack,
  onRefresh,
  showRefreshButton,
}) => {
  return (
    <>
      <div className="sticky top-0 z-30 bg-white shadow-sm p-4 flex items-center justify-between">
        <Button variant="ghost" onClick={onBack} className="p-0 h-auto">
          <ArrowLeft className="mr-2" size={18} />
          <span>Tillbaka</span>
        </Button>
        {showRefreshButton && (
          <Button 
            variant="outline" 
            size="sm" 
            onClick={onRefresh} 
            className="flex items-center gap-1"
          >
            <RefreshCw size={14} />
            <span>Uppdatera detaljer</span>
          </Button>
        )}
      </div>

      <div className="h-64 bg-gray-200 relative">
        <img 
          src={recipe.image_url || '/placeholder.svg'}
          alt={recipe.title}
          className="w-full h-full object-cover"
          onError={(e) => {
            e.currentTarget.src = '/placeholder.svg';
          }}
        />
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4">
          <h1 className="text-2xl font-bold text-white">{recipe.title}</h1>
        </div>
      </div>
    </>
  );
};
