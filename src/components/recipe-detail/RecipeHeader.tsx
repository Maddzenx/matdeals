
import React from "react";
import { Recipe } from "@/types/recipe";

interface RecipeHeaderProps {
  recipe: Recipe;
  onBack: (() => void) | null;
}

export const RecipeHeader: React.FC<RecipeHeaderProps> = ({
  recipe,
  onBack,
}) => {
  const imageUrl = recipe.image_url || 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80';
  
  return (
    <div className="relative">
      <div 
        className="h-64 bg-gray-200 bg-center bg-cover"
        style={{
          backgroundImage: `url(${imageUrl})`,
        }}
      >
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4">
          <h1 className="text-2xl font-bold text-white">{recipe.title}</h1>
        </div>
      </div>
    </div>
  );
};
