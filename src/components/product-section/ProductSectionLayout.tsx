
import React from "react";
import { ProductGrid } from "@/components/ProductGrid";
import { StoreTags } from "@/components/StoreTags";
import { CategoryTabs } from "@/components/CategoryTabs";
import { CategoryData, Product } from "@/data/types";

interface ProductSectionLayoutProps {
  storeTags: { id: string; name: string }[];
  onRemoveTag: (id: string) => void;
  categories: CategoryData[];
  activeCategory: string;
  onCategorySelect: (categoryId: string) => void;
  products: Product[];
  allCategoryNames: string[];
  onQuantityChange: (productId: string, newQuantity: number, previousQuantity: number) => void;
  viewMode: "grid" | "list";
}

export const ProductSectionLayout: React.FC<ProductSectionLayoutProps> = ({
  storeTags,
  onRemoveTag,
  categories,
  activeCategory,
  onCategorySelect,
  products,
  allCategoryNames,
  onQuantityChange,
  viewMode
}) => {
  return (
    <>
      <div className="px-4 pt-2">
        <StoreTags tags={storeTags} onRemove={onRemoveTag} />
      </div>
      <div className="sticky top-[105px] z-10 bg-white">
        <CategoryTabs
          categories={categories}
          activeCategory={activeCategory}
          onSelect={onCategorySelect}
        />
      </div>
      <main className="p-4">
        <ProductGrid
          products={products}
          showCategoryHeaders={true}
          onQuantityChange={onQuantityChange}
          viewMode={viewMode}
          allCategoryNames={allCategoryNames}
        />
      </main>
    </>
  );
};
