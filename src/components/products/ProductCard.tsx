
import React from 'react';
import { ProductCardGrid } from './ProductCardGrid';
import { ProductCardList } from './ProductCardList';

interface ProductCardProps {
  product: {
    id: string;
    name: string;
    details: string;
    image: string;
    currentPrice: string;
    originalPrice: string;
    store: string;
    offerBadge?: string;
    unitPrice?: string;
  };
  onQuantityChange: (productId: string, newQuantity: number, previousQuantity: number, productDetails?: object) => void;
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
        image: product.image,
        store: product.store
      }
    );
  };

  if (viewMode === "grid") {
    return <ProductCardGrid product={product} onQuantityChange={handleQuantityChange} />;
  }

  return <ProductCardList product={product} onQuantityChange={handleQuantityChange} />;
}
