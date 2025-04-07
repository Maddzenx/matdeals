import React from "react";
import { Recipe } from "@/types/recipe";
import { LoadingIndicator } from "@/components/LoadingIndicator";
import { Button } from "@/components/ui/button";
import { RecipeCard } from "./RecipeCard";
import { AlertCircle, RefreshCw } from "lucide-react";

interface RecipeListProps {
  recipes: Recipe[];
  loading: boolean;
  error: Error | null;
  onRefresh: () => void;
}

export const RecipeList: React.FC<RecipeListProps> = ({
  recipes,
  loading,
  error,
  onRefresh
}) => {
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <LoadingIndicator message="Laddar recept..." />
        <p className="text-sm text-gray-500 mt-4">Detta kan ta några sekunder...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="text-red-500 mb-4">
          <AlertCircle size={32} />
        </div>
        <p className="text-center text-red-600 font-medium mb-2">
          {error.message || 'Ett fel inträffade vid laddning av recept.'}
        </p>
        <Button 
          onClick={onRefresh} 
          className="mt-4 bg-red-600 hover:bg-red-700 text-white"
          disabled={loading}
        >
          <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Försök igen
        </Button>
      </div>
    );
  }

  if (recipes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <p className="text-center text-gray-500 mb-4">
          Inga recept hittades för den valda kategorin.
        </p>
        <Button 
          onClick={onRefresh} 
          variant="outline"
          disabled={loading}
        >
          <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Uppdatera recept
        </Button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {recipes.map((recipe) => (
        <RecipeCard key={recipe.id} recipe={recipe} />
      ))}
    </div>
  );
};
