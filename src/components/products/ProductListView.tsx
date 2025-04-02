
import React from 'react';
import { ProductCard } from './ProductCard';
import { Product } from '@/data/types';

interface ProductListViewProps {
  products: Product[];
  viewMode: "grid" | "list";
  onQuantityChange: (productId: string, newQuantity: number, previousQuantity: number, productDetails?: object) => void;
  title?: string;
  categoryName?: string;
}

export function ProductListView({ 
  products, 
  viewMode, 
  onQuantityChange, 
  title = "Erbjudanden",
  categoryName
}: ProductListViewProps) {
  if (!products || products.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">Inga produkter hittades</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-[#1C1C1C] mb-4">
        {categoryName ? categoryName : title}
      </h2>
      <div className={viewMode === "grid" ? "grid grid-cols-2 gap-4" : "flex flex-col gap-4"}>
        {products.map(product => (
          <ProductCard 
            key={product.id}
            product={product}
            onQuantityChange={onQuantityChange}
            viewMode={viewMode}
          />
        ))}
      </div>
    </div>
  );
}
