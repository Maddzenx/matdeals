
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Clock, Users, ChefHat } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Recipe } from "@/hooks/useRecipes";
import { useNavigate } from "react-router-dom";

interface RecipeCardProps {
  recipe: Recipe;
}

export const RecipeCard: React.FC<RecipeCardProps> = ({ recipe }) => {
  const navigate = useNavigate();
  
  // Format price helper
  const formatPrice = (price: number | null) => {
    if (price === null) return "";
    return `${price} kr`;
  };

  // Determine difficulty icon and color
  const getDifficultyProps = (difficulty: string | null) => {
    switch (difficulty?.toLowerCase()) {
      case "lätt":
        return { color: "text-green-600", level: "Lätt" };
      case "avancerad":
        return { color: "text-red-600", level: "Avancerad" };
      default:
        return { color: "text-orange-500", level: "Medel" };
    }
  };

  const difficultyProps = getDifficultyProps(recipe.difficulty);
  
  const handleCardClick = () => {
    navigate(`/recipe/${recipe.id}`);
  };
  
  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click when button is clicked
    // Add to cart functionality here
    console.log("Add to cart:", recipe.title);
  };
  
  return (
    <Card 
      className="overflow-hidden border border-gray-100 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
      onClick={handleCardClick}
    >
      <div className="h-48 bg-gray-200 relative">
        {recipe.image_url ? (
          <img 
            src={recipe.image_url}
            alt={recipe.title}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.currentTarget.src = '/placeholder.svg';
            }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-500">
            Ingen bild tillgänglig
          </div>
        )}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4">
          <h3 className="text-xl font-bold text-white">{recipe.title}</h3>
        </div>
      </div>
      <CardContent className="p-4">
        <div className="flex gap-2 mb-2 flex-wrap">
          {recipe.tags?.slice(0, 3).map((tag) => (
            <span 
              key={tag}
              className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-xs font-medium"
            >
              {tag}
            </span>
          ))}
        </div>
        
        <div className="flex justify-between mb-4 text-xs text-gray-500">
          <div className="flex items-center">
            <Clock size={14} className="mr-1" /> 
            {recipe.time_minutes} min
          </div>
          
          {recipe.servings && (
            <div className="flex items-center">
              <Users size={14} className="mr-1" /> 
              {recipe.servings} pers
            </div>
          )}
          
          <div className={`flex items-center ${difficultyProps.color}`}>
            <ChefHat size={14} className="mr-1" /> 
            {difficultyProps.level}
          </div>
        </div>
        
        {recipe.description && (
          <p className="text-sm text-gray-700 mb-4 line-clamp-2">
            {recipe.description}
          </p>
        )}
        
        <div className="flex items-center justify-between">
          <div className="flex items-baseline">
            {recipe.original_price && (
              <span className="text-gray-500 line-through text-sm mr-2">
                {formatPrice(recipe.original_price)}
              </span>
            )}
            <span className="text-[#DB2C17] font-bold text-lg">
              {formatPrice(recipe.price)}
            </span>
          </div>
          <Button 
            className="bg-[#DB2C17] hover:bg-[#c02615]"
            onClick={handleAddToCart}
          >
            Lägg till
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
