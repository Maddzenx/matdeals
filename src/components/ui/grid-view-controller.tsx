
import React from 'react';
import { ProductGrid } from '@/components/ProductGrid';
import { Product } from '@/data/productData';

interface GridViewControllerProps {
  products: Product[];
  showCategoryHeaders?: boolean;
  onQuantityChange: (productId: string, newQuantity: number, previousQuantity: number) => void;
  viewMode?: "grid" | "list";
}

export const GridViewController: React.FC<GridViewControllerProps> = ({
  products,
  showCategoryHeaders = false,
  onQuantityChange,
  viewMode = "grid"
}) => {
  // Pass the props to ProductGrid, which will handle them appropriately
  return (
    <ProductGrid 
      products={products}
      showCategoryHeaders={showCategoryHeaders}
      onQuantityChange={onQuantityChange}
      className={viewMode === "list" ? "grid-cols-1 gap-4" : ""}
    />
  );
};
