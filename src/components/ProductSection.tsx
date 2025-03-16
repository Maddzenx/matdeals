
import React, { useEffect } from "react";
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
  
  // Log to help debug visibility issues
  useEffect(() => {
    console.log("ProductSection rendered with supabaseProducts:", supabaseProducts.length);
    if (supabaseProducts.length > 0) {
      console.log("Supabase products first few:", supabaseProducts.slice(0, 3));
    }
  }, [supabaseProducts]);
  
  // Combine local products with Supabase products
  const allProducts = React.useMemo(() => {
    console.log("Combining products - local:", allLocalProducts.length, "supabase:", supabaseProducts.length);
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

  useEffect(() => {
    console.log("After filtering - products to display:", filteredProducts.length);
    console.log("Active stores:", activeStoreIds);
    // Add detailed logging for debugging purposes
    if (filteredProducts.length === 0) {
      console.warn("No products after filtering. Check activeStoreIds:", activeStoreIds);
      console.warn("Store tags:", storeTags);
      
      // Log first few products before filtering
      if (allProducts.length > 0) {
        console.warn("Sample products before filtering:", 
          allProducts.slice(0, 3).map(p => ({
            id: p.id, 
            name: p.name, 
            store: p.store,
            category: p.category
          }))
        );
      }
    }
  }, [filteredProducts, activeStoreIds, storeTags, allProducts]);

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
