
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
  // Helper function to translate category names if needed
  const translateCategory = (name: string): string => {
    const translations: Record<string, string> = {
      "All": "Alla",
      "Fruits & Vegetables": "Frukt & Grönt",
      "Meat": "Kött",
      "Fish": "Fisk",
      "Dairy": "Mejeri",
      "Snacks": "Snacks",
      "Bread": "Bröd",
      "Drinks": "Drycker",
      "Other": "Övrigt"
    };

    return translations[name] || name;
  };

  // Get the active category name (translated if needed)
  const activeCategoryName = categories.find(c => c.id === activeCategory)?.name || "";
  const translatedCategoryName = translateCategory(activeCategoryName);

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
        {/* Display the active category name as a heading if it's not "All" */}
        {activeCategory !== "all" && activeCategoryName && (
          <h2 className="text-xl font-bold text-[#1C1C1C] mb-4">{translatedCategoryName}</h2>
        )}
        <ProductGrid
          products={products}
          showCategoryHeaders={activeCategory === "all"} // Only show category headers in "All" view
          onQuantityChange={onQuantityChange}
          viewMode={viewMode}
          allCategoryNames={allCategoryNames}
        />
      </main>
    </>
  );
};
