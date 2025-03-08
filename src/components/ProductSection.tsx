
import React from "react";
import { CategoryData, Product } from "@/data/types";
import { useProductUtils } from "@/hooks/useProductUtils";
import { useProductSection } from "@/hooks/useProductSection";
import { ProductSectionLayout } from "@/components/product-section/ProductSectionLayout";

interface ProductSectionProps {
  categories: CategoryData[];
  storeTags: { id: string; name: string }[];
  activeStoreIds: string[];
  onProductQuantityChange: (
    productId: string, 
    newQuantity: number, 
    previousQuantity: number,
    productDetails?: {
      name: string;
      details: string;
      price: string;
      image?: string;
      store?: string;
    }
  ) => void;
  onRemoveTag: (id: string) => void;
  viewMode?: "grid" | "list";
  searchQuery?: string;
  supabaseProducts?: Product[];
}

export const ProductSection: React.FC<ProductSectionProps> = ({
  categories,
  storeTags,
  activeStoreIds,
  onProductQuantityChange,
  onRemoveTag,
  viewMode = "grid",
  searchQuery = "",
  supabaseProducts = []
}) => {
  const { getProductsWithCategories } = useProductUtils(categories);
  const allLocalProducts = getProductsWithCategories();
  
  // Combine local products with Supabase products
  const allProducts = React.useMemo(() => {
    if (supabaseProducts.length === 0) {
      return allLocalProducts;
    }
    return [...allLocalProducts, ...supabaseProducts];
  }, [allLocalProducts, supabaseProducts]);
  
  const { 
    filteredProducts,
    activeCategory,
    nonEmptyCategories,
    allCategoryNames,
    handleCategorySelect
  } = useProductSection(
    categories,
    allProducts,
    activeStoreIds,
    storeTags,
    searchQuery
  );

  const handleQuantityChange = (productId: string, newQuantity: number, previousQuantity: number) => {
    // Find product details to include when changing quantity
    const product = allProducts.find(p => p.id === productId);
    if (product) {
      console.log("Product store info:", product.store);
      
      onProductQuantityChange(
        productId, 
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
    } else {
      onProductQuantityChange(productId, newQuantity, previousQuantity);
    }
  };

  return (
    <ProductSectionLayout
      storeTags={storeTags}
      onRemoveTag={onRemoveTag}
      categories={nonEmptyCategories}
      activeCategory={activeCategory}
      onCategorySelect={handleCategorySelect}
      products={filteredProducts}
      allCategoryNames={allCategoryNames}
      onQuantityChange={handleQuantityChange}
      viewMode={viewMode}
    />
  );
};
