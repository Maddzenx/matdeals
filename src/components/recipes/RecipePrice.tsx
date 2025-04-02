
import React from "react";
import { Recipe } from "@/types/recipe";

export function RecipePrice({ recipe, compact = false }: { recipe: Recipe; compact?: boolean }) {
  const hasDiscount = Boolean(
    (recipe.calculatedOriginalPrice || 0) > 0 && 
    (recipe.calculatedPrice || 0) < (recipe.calculatedOriginalPrice || 0)
  );
  
  // Format with two decimals and replace dot with comma (Swedish format)
  const formatPrice = (price: number | null | undefined): string => {
    if (price === null || price === undefined) return '-';
    return `${price.toFixed(2).replace('.', ',')} kr`;
  };
  
  if (compact) {
    return (
      <div className="flex items-center space-x-1 text-sm">
        <span className="font-semibold">
          {formatPrice(recipe.calculatedPrice || 0)}
        </span>
        {hasDiscount && (
          <span className="text-gray-500 line-through text-xs">
            {formatPrice(recipe.calculatedOriginalPrice || 0)}
          </span>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      <div className="flex items-baseline gap-2">
        <span className="text-xl font-bold">
          {formatPrice(recipe.calculatedPrice || 0)}
        </span>
        {hasDiscount && (
          <span className="text-gray-500 line-through">
            {formatPrice(recipe.calculatedOriginalPrice || 0)}
          </span>
        )}
      </div>
      
      {hasDiscount && recipe.savings && recipe.savings > 0 && (
        <p className="text-green-600 text-sm font-medium">
          Spara {formatPrice(recipe.savings)}
        </p>
      )}
    </div>
  );
}
