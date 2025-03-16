
import React from "react";
import { Tag } from "lucide-react";
import { Product } from "@/data/types";
import { productMatchesIngredient } from "@/utils/ingredientsMatchUtils";

interface RecipeIngredientsProps {
  ingredients: string[] | null;
  servings: number | null;
  matchedProducts?: Product[];
}

export const RecipeIngredients: React.FC<RecipeIngredientsProps> = ({
  ingredients,
  servings,
  matchedProducts = []
}) => {
  if (!ingredients || ingredients.length === 0) {
    return null;
  }

  // Check if an ingredient has a matching discounted product
  const isDiscounted = (ingredient: string): Product | undefined => {
    if (!matchedProducts || matchedProducts.length === 0) return undefined;
    return matchedProducts.find(product => productMatchesIngredient(product.name, ingredient));
  };

  return (
    <div className="mb-6">
      <h2 className="text-xl font-bold mb-2">Ingredienser</h2>
      {servings && (
        <p className="text-gray-500 text-sm mb-3">Ingredienser för {servings} personer</p>
      )}
      <ul className="space-y-2">
        {ingredients.map((ingredient, idx) => {
          const discountedProduct = isDiscounted(ingredient);
          
          return (
            <li key={idx} className={`flex items-baseline ${discountedProduct ? 'bg-gray-50 p-2 rounded-md' : ''}`}>
              <span className={`inline-block w-2 h-2 ${discountedProduct ? 'bg-[#DB2C17]' : 'bg-gray-400'} rounded-full mr-2`}></span>
              <span className="text-gray-800">{ingredient}</span>
              
              {discountedProduct && (
                <div className="ml-auto flex items-center text-xs text-[#DB2C17]">
                  <Tag size={12} className="mr-1" />
                  <span>REA {discountedProduct.currentPrice}</span>
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
};
