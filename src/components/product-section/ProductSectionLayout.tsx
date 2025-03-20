
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

  // Filter products for the active category or show all if "all" is selected
  const filteredCategoryProducts = activeCategory === "all" 
    ? products 
    : products.filter(product => {
        // Match by both category ID and name for flexibility
        if (activeCategory === "fruits") return product.category === "fruits";
        if (activeCategory === "meat") return product.category === "meat";
        if (activeCategory === "fish") return product.category === "fish";
        if (activeCategory === "dairy") return product.category === "dairy";
        if (activeCategory === "snacks") return product.category === "snacks";
        if (activeCategory === "bread") return product.category === "bread";
        if (activeCategory === "drinks") return product.category === "drinks";
        if (activeCategory === "other") return product.category === "other";
        
        // Fallback to comparing with category name
        const categoryData = categories.find(c => c.id === activeCategory);
        return categoryData && product.category === categoryData.id;
      });
      
  console.log(`Category filtering: Active category = ${activeCategory}, Products after filter: ${filteredCategoryProducts.length}`);
  if (filteredCategoryProducts.length > 0) {
    console.log("Sample product after category filtering:", filteredCategoryProducts[0]);
  }

  return (
    <>
      <div className="px-4 pt-2">
        <StoreTags tags={storeTags} onRemove={onRemoveTag} />
      </div>
      <CategoryTabs
        categories={categories}
        activeCategory={activeCategory}
        onSelect={onCategorySelect}
      />
      <main className="p-4 mt-[120px]">
        {/* Display the active category name as a heading if it's not "All" */}
        {activeCategory !== "all" && activeCategoryName && (
          <h2 className="text-xl font-bold text-[#1C1C1C] mb-4">{translatedCategoryName}</h2>
        )}
        
        {/* Debug output to troubleshoot */}
        <div className="bg-gray-100 p-2 mb-4 rounded text-sm" style={{display: 'none'}}>
          <p>Filtered products: {filteredCategoryProducts.length}</p>
          <p>Active category: {activeCategory}</p>
        </div>
        
        <ProductGrid
          products={filteredCategoryProducts}
          showCategoryHeaders={activeCategory === "all"} // Only show category headers in "All" view
          onQuantityChange={onQuantityChange}
          viewMode={viewMode}
          allCategoryNames={allCategoryNames}
        />
      </main>
    </>
  );
};
