
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
}

export const ProductGrid: React.FC<ProductGridProps> = ({
  title,
  products,
}) => {
  return (
    <>
      <h2 className="text-base font-bold text-black mb-4">{title}</h2>
      <div className="grid grid-cols-2 gap-4 max-sm:gap-3">
        {products.map((product) => (
          <ProductCard key={product.id} {...product} />
        ))}
      </div>
    </>
  );
};
