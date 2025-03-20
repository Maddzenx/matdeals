
import React from "react";
import { Tag } from "lucide-react";
import { Product } from "@/data/types";
import { productMatchesIngredient } from "@/utils/ingredientsMatchUtils";
import { Badge } from "@/components/ui/badge";

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
      <ul className="space-y-3">
        {ingredients.map((ingredient, idx) => {
          const discountedProduct = isDiscounted(ingredient);
          
          return (
            <li 
              key={idx} 
              className={`flex items-start p-3 rounded-lg ${
                discountedProduct ? 'bg-gray-50 border border-gray-100 shadow-sm' : ''
              }`}
            >
              <span className={`inline-block w-2 h-2 mt-1.5 ${
                discountedProduct ? 'bg-[#DB2C17]' : 'bg-gray-400'
              } rounded-full mr-3`}></span>
              
              <div className="flex-1">
                <span className="text-gray-800 leading-tight">{ingredient}</span>
                
                {discountedProduct && (
                  <div className="mt-1.5 flex items-center">
                    <Badge 
                      variant="outline" 
                      className="bg-white border-[#DB2C17] text-[#DB2C17] px-2 py-0.5 text-xs flex items-center"
                    >
                      <Tag size={10} className="mr-1" />
                      <span className="font-medium">{discountedProduct.currentPrice}</span>
                      {discountedProduct.originalPrice && (
                        <span className="ml-1.5 line-through text-gray-500 text-[10px]">
                          {discountedProduct.originalPrice}
                        </span>
                      )}
                    </Badge>
                  </div>
                )}
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
};
