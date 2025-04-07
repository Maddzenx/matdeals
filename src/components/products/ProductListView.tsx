
import React from 'react';
import { ProductCard } from './ProductCard';
import { Product } from '@/types/product';

interface ProductListViewProps {
  products: Product[];
  viewMode: "grid" | "list";
  onQuantityChange: (
    productId: string, 
    newQuantity: number, 
    previousQuantity: number, 
    productDetails?: {
      name: string;
      details: string;
      price: string;
      image?: string;
      store?: string;
      recipeId?: string;
      recipeTitle?: string;
    }
  ) => void;
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
            product={{
              id: product.id,
              name: product.name,
              details: product.details || product.description || "",
              currentPrice: product.currentPrice || `${product.price} kr`,
              originalPrice: product.originalPrice?.toString() || "",
              store: product.store,
              offerBadge: product.offerBadge,
              unitPrice: product.unitPrice,
              offer_details: product.offer_details,
              image: product.image || product.image_url,
              is_kortvara: product.is_kortvara
            }}
            onQuantityChange={(productId, newQuantity, previousQuantity) => {
              onQuantityChange(productId, newQuantity, previousQuantity, {
                name: product.name,
                details: product.details || product.description || "",
                price: product.currentPrice || `${product.price} kr`,
                image: product.image || product.image_url,
                store: product.store
              });
            }}
            viewMode={viewMode}
          />
        ))}
      </div>
    </div>
  );
}
