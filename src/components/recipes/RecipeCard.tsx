
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Clock, Users, ChefHat, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Recipe } from "@/types/recipe";
import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

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

  // Display savings badge if there are discounted ingredients
  const hasSavings = recipe.matchedProducts && recipe.matchedProducts.length > 0;
  
  return (
    <Card 
      className="overflow-hidden border border-gray-100 shadow-sm hover:shadow-md transition-shadow cursor-pointer relative"
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
        
        {hasSavings && (
          <div className="absolute top-2 right-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Badge className="bg-[#DB2C17] hover:bg-[#c02615] flex items-center gap-1">
                    <ShoppingBag size={12} />
                    {recipe.matchedProducts?.length} REA
                  </Badge>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Ingredienser på rea just nu!</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        )}
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
            {recipe.calculatedOriginalPrice && recipe.calculatedOriginalPrice > recipe.calculatedPrice ? (
              <span className="text-gray-500 line-through text-sm mr-2">
                {formatPrice(recipe.calculatedOriginalPrice)}
              </span>
            ) : recipe.original_price ? (
              <span className="text-gray-500 line-through text-sm mr-2">
                {formatPrice(recipe.original_price)}
              </span>
            ) : null}
            
            <span className="text-[#DB2C17] font-bold text-lg">
              {recipe.calculatedPrice ? formatPrice(recipe.calculatedPrice) : formatPrice(recipe.price)}
            </span>
            
            {hasSavings && recipe.savings && recipe.savings > 0 && (
              <span className="ml-2 text-green-600 text-xs font-semibold">
                (spara {recipe.savings} kr)
              </span>
            )}
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
