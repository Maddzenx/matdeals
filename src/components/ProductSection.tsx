
import React, { useState } from "react";
import { ProductGrid } from "@/components/ProductGrid";
import { StoreTags } from "@/components/StoreTags";
import { CategoryTabs } from "@/components/CategoryTabs";
import { CategoryData } from "@/data/productData";
import { useProductUtils } from "@/hooks/useProductUtils";

interface ProductSectionProps {
  categories: CategoryData[];
  storeTags: { id: string; name: string }[];
  onProductQuantityChange: (productId: string, newQuantity: number, previousQuantity: number) => void;
  onRemoveTag: (id: string) => void;
}

export const ProductSection: React.FC<ProductSectionProps> = ({
  categories,
  storeTags,
  onProductQuantityChange,
  onRemoveTag
}) => {
  const [activeCategory, setActiveCategory] = useState("fruits");
  const { getProductsWithCategories, scrollToCategory } = useProductUtils(categories);
  
  const allProducts = getProductsWithCategories();

  const handleCategorySelect = (categoryId: string) => {
    setActiveCategory(categoryId);
    scrollToCategory(categoryId);
  };

  return (
    <>
      <StoreTags tags={storeTags} onRemove={onRemoveTag} />
      <CategoryTabs
        categories={categories}
        activeCategory={activeCategory}
        onSelect={handleCategorySelect}
      />
      <main className="p-4">
        <ProductGrid
          products={allProducts}
          showCategoryHeaders={true}
          onQuantityChange={onProductQuantityChange}
        />
      </main>
    </>
  );
};
