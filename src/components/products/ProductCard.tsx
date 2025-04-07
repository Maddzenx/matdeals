
import React from 'react';
import { ProductCardGrid } from './ProductCardGrid';
import { ProductCardList } from './ProductCardList';

interface ProductCardProps {
  product: {
    id: string;
    name: string;
    details: string;
    currentPrice: string;
    originalPrice: string;
    store: string;
    offerBadge?: string;
    unitPrice?: string;
    offer_details?: string;
    image?: string;
  };
  onQuantityChange: (
    productId: string, 
    newQuantity: number, 
    previousQuantity: number, 
    productDetails?: {
      name: string;
      details: string;
      price: string;
      store?: string;
      recipeId?: string;
      recipeTitle?: string;
    }
  ) => void;
  viewMode: "grid" | "list";
}

export function ProductCard({ product, onQuantityChange, viewMode }: ProductCardProps) {
  const handleQuantityChange = (newQuantity: number, previousQuantity: number) => {
    onQuantityChange(
      product.id,
      newQuantity,
      previousQuantity,
      {
        name: product.name,
        details: product.details,
        price: product.currentPrice,
        store: product.store
      }
    );
  };

  if (viewMode === "grid") {
    return <ProductCardGrid product={product} onQuantityChange={handleQuantityChange} />;
  }

  return <ProductCardList product={product} onQuantityChange={handleQuantityChange} />;
}
