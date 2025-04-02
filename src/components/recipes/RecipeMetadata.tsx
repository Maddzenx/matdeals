
import React from "react";
import { Clock, Users, ChefHat } from "lucide-react";
import { Recipe } from "@/types/recipe";

interface RecipeMetadataProps {
  recipe: Recipe;
}

export const RecipeMetadata: React.FC<RecipeMetadataProps> = ({ recipe }) => {
  // Determine difficulty icon and color
  const getDifficultyProps = (difficulty: string | null | undefined) => {
    if (!difficulty) return { color: "text-orange-500", level: "Medel" };
    
    switch (difficulty.toLowerCase()) {
      case "lätt":
        return { color: "text-green-600", level: "Lätt" };
      case "avancerad":
        return { color: "text-red-600", level: "Avancerad" };
      default:
        return { color: "text-orange-500", level: "Medel" };
    }
  };

  const difficultyProps = getDifficultyProps(recipe.difficulty);

  return (
    <div className="flex justify-between mb-4 text-sm text-gray-500">
      <div className="flex items-center">
        <Clock size={16} className="mr-1.5" /> 
        {recipe.time_minutes} min
      </div>
      
      {recipe.servings && (
        <div className="flex items-center">
          <Users size={16} className="mr-1.5" /> 
          {recipe.servings} pers
        </div>
      )}
      
      <div className={`flex items-center ${difficultyProps.color}`}>
        <ChefHat size={16} className="mr-1.5" /> 
        {difficultyProps.level}
      </div>
    </div>
  );
};
