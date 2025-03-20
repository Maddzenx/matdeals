
import React from "react";
import { Button } from "@/components/ui/button";
import { ShoppingBag } from "lucide-react";
import { Product } from "@/data/types";

interface RecipePricingProps {
  price: number | null;
  originalPrice: number | null;
  onAddToCart: () => void;
  matchedProducts?: Product[];
  savings?: number;
}

export const RecipePricing: React.FC<RecipePricingProps> = ({
  price,
  originalPrice,
  onAddToCart,
  matchedProducts,
  savings,
}) => {
  // Format price helper
  const formatPrice = (price: number | null) => {
    if (price === null) return "";
    return `${price} kr`;
  };

  if (!price) {
    return null;
  }

  const hasDiscountedIngredients = matchedProducts && matchedProducts.length > 0;

  return (
    <div className="bg-gray-50 p-5 rounded-lg mt-6 mb-4">
      <div className="flex items-center justify-between">
        <div className="flex flex-col">
          <span className="text-gray-500 text-sm">Uppskattat pris</span>
          <div className="flex items-baseline">
            {originalPrice && originalPrice > price && (
              <span className="text-gray-500 line-through text-sm mr-2">
                {formatPrice(originalPrice)}
              </span>
            )}
            <span className="text-[#DB2C17] font-bold text-xl">
              {formatPrice(price)}
            </span>
            {savings && savings > 0 && (
              <span className="ml-2 text-green-600 text-sm font-semibold">
                (spara {savings} kr)
              </span>
            )}
          </div>
          
          {hasDiscountedIngredients && (
            <div className="mt-1 flex items-center text-sm text-green-600">
              <ShoppingBag size={14} className="mr-1" />
              <span>{matchedProducts.length} ingredienser på rea!</span>
            </div>
          )}
        </div>
        <Button 
          className="bg-[#DB2C17] hover:bg-[#c02615] text-base py-6 px-5"
          onClick={(e) => {
            if (e) {
              e.stopPropagation();
            }
            onAddToCart();
          }}
        >
          Lägg till handlingslista
        </Button>
      </div>
    </div>
  );
};
