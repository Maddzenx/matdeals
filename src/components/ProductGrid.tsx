
import React from "react";
import { ProductCard } from "./ProductCard";

interface Product {
  id: string;
  image: string;
  name: string;
  details: string;
  currentPrice: string;
  originalPrice: string;
  store: string;
  offerBadge?: string;
}

interface ProductGridProps {
  title: string;
  products: Product[];
  onQuantityChange?: (productId: string, newQuantity: number, previousQuantity: number) => void;
}

export const ProductGrid: React.FC<ProductGridProps> = ({ 
  title, 
  products,
  onQuantityChange 
}) => {
  return (
    <div>
      <h2 className="text-base font-bold text-[#1C1C1C] mb-3">{title}</h2>
      <div className="grid grid-cols-2 gap-2.5">
        {products.map((product) => (
          <ProductCard
            key={product.id}
            id={product.id}
            image={product.image}
            name={product.name}
            details={product.details}
            currentPrice={product.currentPrice}
            originalPrice={product.originalPrice}
            store={product.store}
            offerBadge={product.offerBadge}
            onQuantityChange={onQuantityChange}
          />
        ))}
      </div>
    </div>
  );
};
