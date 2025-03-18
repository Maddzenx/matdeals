
import React from "react";
import { Recipe } from "@/types/recipe";
import { LoadingIndicator } from "@/components/LoadingIndicator";
import { Button } from "@/components/ui/button";
import { RecipeCard } from "./RecipeCard";

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
    return <LoadingIndicator message="Laddar recept..." />;
  }

  if (error) {
    return (
      <div className="text-center py-8 text-red-500">
        <p>Ett fel inträffade vid laddning av recept.</p>
        <p className="text-sm">{error.message}</p>
        <Button onClick={onRefresh} className="mt-4" variant="destructive">
          Försök igen
        </Button>
      </div>
    );
  }

  if (recipes.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p>Inga recept hittades. Ladda in recept genom att klicka på knappen nedan.</p>
        <Button onClick={onRefresh} className="mt-4">
          Läs in recept från godare.se
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
