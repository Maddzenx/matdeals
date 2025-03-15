
import React from "react";
import { Button } from "@/components/ui/button";

interface RecipePricingProps {
  price: number | null;
  originalPrice: number | null;
  onAddToCart: () => void;
}

export const RecipePricing: React.FC<RecipePricingProps> = ({
  price,
  originalPrice,
  onAddToCart,
}) => {
  // Format price helper
  const formatPrice = (price: number | null) => {
    if (price === null) return "";
    return `${price} kr`;
  };

  if (!price) {
    return null;
  }

  return (
    <div className="bg-gray-50 p-4 rounded-lg mt-6 mb-4">
      <div className="flex items-center justify-between">
        <div className="flex flex-col">
          <span className="text-gray-500 text-sm">Uppskattat pris</span>
          <div className="flex items-baseline">
            {originalPrice && (
              <span className="text-gray-500 line-through text-sm mr-2">
                {formatPrice(originalPrice)}
              </span>
            )}
            <span className="text-[#DB2C17] font-bold text-lg">
              {formatPrice(price)}
            </span>
          </div>
        </div>
        <Button 
          className="bg-[#DB2C17] hover:bg-[#c02615]"
          onClick={onAddToCart}
        >
          Lägg till handlingslista
        </Button>
      </div>
    </div>
  );
};
