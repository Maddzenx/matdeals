
import React from "react";
import { Button } from "@/components/ui/button";
import { ShoppingBag, User } from "lucide-react";
import { Product } from "@/data/types";
import { Badge } from "@/components/ui/badge";

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
  
  // Check if there are any member prices
  const hasMemberPrices = matchedProducts?.some(p => p.offerBadge === "Stämmispris") || false;

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
              
              {hasMemberPrices && (
                <div className="flex items-center ml-2">
                  <User size={12} className="mr-1 text-blue-600" />
                  <Badge variant="outline" className="text-[0.6rem] py-0 px-1 h-4 bg-blue-50 text-blue-600 border-blue-200">
                    Inkl. medlemspriser
                  </Badge>
                </div>
              )}
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
