
import React, { useState } from "react";
import { ProductGrid } from "@/components/ProductGrid";
import { StoreTags } from "@/components/StoreTags";
import { CategoryTabs } from "@/components/CategoryTabs";
import { CategoryData } from "@/data/productData";
import { useProductUtils } from "@/hooks/useProductUtils";

interface ProductSectionProps {
  categories: CategoryData[];
  storeTags: { id: string; name: string }[];
  onProductQuantityChange: (
    productId: string, 
    newQuantity: number, 
    previousQuantity: number,
    productDetails?: {
      name: string;
      details: string;
      price: string;
      image?: string;
    }
  ) => void;
  onRemoveTag: (id: string) => void;
  viewMode?: "grid" | "list";
}

export const ProductSection: React.FC<ProductSectionProps> = ({
  categories,
  storeTags,
  onProductQuantityChange,
  onRemoveTag,
  viewMode = "grid"
}) => {
  const [activeCategory, setActiveCategory] = useState("fruits");
  const { getProductsWithCategories, scrollToCategory, getAllCategoryNames } = useProductUtils(categories);
  
  const allProducts = getProductsWithCategories();
  const allCategoryNames = getAllCategoryNames();

  const handleCategorySelect = (categoryId: string) => {
    setActiveCategory(categoryId);
    scrollToCategory(categoryId);
  };

  const handleQuantityChange = (productId: string, newQuantity: number, previousQuantity: number) => {
    // Find product details to include when changing quantity
    const product = allProducts.find(p => p.id === productId);
    if (product) {
      onProductQuantityChange(
        productId, 
        newQuantity, 
        previousQuantity, 
        {
          name: product.name,
          details: product.details,
          price: product.currentPrice,
          image: product.image
        }
      );
    } else {
      onProductQuantityChange(productId, newQuantity, previousQuantity);
    }
  };

  return (
    <>
      <div className="px-4 pt-2">
        <StoreTags tags={storeTags} onRemove={onRemoveTag} />
      </div>
      <div className="sticky top-[105px] z-10 bg-white">
        <CategoryTabs
          categories={categories}
          activeCategory={activeCategory}
          onSelect={handleCategorySelect}
        />
      </div>
      <main className="p-4">
        <ProductGrid
          products={allProducts}
          showCategoryHeaders={true}
          onQuantityChange={handleQuantityChange}
          viewMode={viewMode}
          allCategoryNames={allCategoryNames}
        />
      </main>
    </>
  );
};
