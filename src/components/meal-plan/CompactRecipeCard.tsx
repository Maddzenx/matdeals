
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Heart, Clock, Users, Plus } from "lucide-react";
import { Recipe } from "@/types/recipe";
import { useNavigate } from "react-router-dom";

interface CompactRecipeCardProps {
  recipe: Recipe;
  isFavorite: boolean;
  onToggleFavorite: () => void;
  onAddToMealPlan: () => void;
}

export const CompactRecipeCard: React.FC<CompactRecipeCardProps> = ({
  recipe,
  isFavorite,
  onToggleFavorite,
  onAddToMealPlan
}) => {
  const navigate = useNavigate();

  const handleCardClick = () => {
    navigate(`/recipe/${recipe.id}`);
  };

  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow">
      <div className="flex">
        <div 
          className="h-24 w-24 bg-gray-200 cursor-pointer"
          onClick={handleCardClick}
        >
          {recipe.image_url && (
            <img 
              src={recipe.image_url} 
              alt={recipe.title} 
              className="h-full w-full object-cover"
              onError={(e) => {
                e.currentTarget.src = '/placeholder.svg';
              }}
            />
          )}
        </div>
        
        <CardContent className="flex-1 p-3">
          <div className="flex justify-between items-start">
            <h3 
              className="font-medium text-sm cursor-pointer hover:text-[#DB2C17]"
              onClick={handleCardClick}
            >
              {recipe.title}
            </h3>
            <button 
              className="text-gray-400 hover:text-[#DB2C17]"
              onClick={(e) => {
                e.stopPropagation();
                onToggleFavorite();
              }}
            >
              <Heart size={16} className={isFavorite ? "text-[#DB2C17] fill-[#DB2C17]" : ""} />
            </button>
          </div>
          
          <div className="flex text-xs text-gray-500 mt-1 space-x-3">
            <span className="flex items-center">
              <Clock size={12} className="mr-1" />
              {recipe.time_minutes} min
            </span>
            <span className="flex items-center">
              <Users size={12} className="mr-1" />
              {recipe.servings} port
            </span>
          </div>
          
          <div className="mt-2 flex justify-end">
            <Button 
              size="sm" 
              variant="outline"
              className="py-1 h-7 text-xs"
              onClick={(e) => {
                e.stopPropagation();
                onAddToMealPlan();
              }}
            >
              <Plus size={12} className="mr-1" />
              Lägg till
            </Button>
          </div>
        </CardContent>
      </div>
    </Card>
  );
};
