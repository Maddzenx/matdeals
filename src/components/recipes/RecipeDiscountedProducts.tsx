
import React from "react";
import { ShoppingBag } from "lucide-react";
import { Product } from "@/data/types";

interface RecipeDiscountedProductsProps {
  products: Product[];
  show: boolean;
}

export const RecipeDiscountedProducts: React.FC<RecipeDiscountedProductsProps> = ({
  products,
  show,
}) => {
  if (!show || !products || products.length === 0) {
    return null;
  }

  return (
    <div className="mb-3 p-2 bg-gray-50 rounded-md">
      <h4 className="text-sm font-semibold mb-1 flex items-center">
        <ShoppingBag size={14} className="inline mr-1 text-[#DB2C17]" />
        Rabatterade ingredienser:
      </h4>
      <ul className="text-xs space-y-1">
        {products.map((product, idx) => (
          <li key={idx} className="flex justify-between">
            <div className="flex-grow">{product.name}</div>
            <div className="flex items-center">
              {product.originalPrice && (
                <span className="line-through mr-1 text-gray-500">{product.originalPrice}</span>
              )}
              <span className="font-semibold text-[#DB2C17]">{product.currentPrice}</span>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};
