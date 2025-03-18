
import React from "react";
import { Recipe } from "@/types/recipe";

interface RecipePriceProps {
  recipe: Recipe;
  hasSavings: boolean;
  hidePricing?: boolean;
}

export const RecipePrice: React.FC<RecipePriceProps> = ({ 
  recipe, 
  hasSavings,
  hidePricing = false 
}) => {
  if (hidePricing) {
    return null;
  }
  
  // Format price helper
  const formatPrice = (price: number | null) => {
    if (price === null) return "";
    return `${price} kr`;
  };

  return (
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
  );
};
