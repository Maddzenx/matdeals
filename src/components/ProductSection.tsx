
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
  
  useEffect(() => {
    console.log("ProductSection rendered with supabaseProducts:", supabaseProducts.length);
    if (supabaseProducts.length > 0) {
      console.log("Supabase products first few:", supabaseProducts.slice(0, 3));
      
      // Log store information for debugging
      const storeDistribution = supabaseProducts.reduce((acc, p) => {
        const store = p.store?.toLowerCase() || 'unknown';
        acc[store] = (acc[store] || 0) + 1;
        return acc;
      }, {});
      console.log("Store distribution in supabase products:", storeDistribution);
      console.log("Active store IDs for filtering:", activeStoreIds);
    }
  }, [supabaseProducts, activeStoreIds]);
  
  const allProducts = React.useMemo(() => {
    console.log("Combining products - local:", allLocalProducts.length, "supabase:", supabaseProducts.length);
    return [...allLocalProducts, ...supabaseProducts];
  }, [allLocalProducts, supabaseProducts]);
  
  // Modified useProductSection hook usage
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
    
    if (filteredProducts.length === 0 && allProducts.length > 0) {
      console.warn("No products after filtering. Check filtering logic:");
      console.warn("Active store IDs:", activeStoreIds);
      console.warn("Search query:", searchQuery);
      console.warn("Active category:", activeCategory);
      
      // Debug the filtering logic
      const productsAfterStoreFilter = allProducts.filter(product => {
        const productStore = product.store?.toLowerCase();
        return productStore && activeStoreIds.includes(productStore);
      });
      
      console.log("Products after store filter only:", productsAfterStoreFilter.length);
      
      if (productsAfterStoreFilter.length === 0 && allProducts.length > 0) {
        console.log("Store filtering is eliminating all products. Sample products stores:");
        allProducts.slice(0, 5).forEach(p => console.log("Product store:", p.store));
      }
    }
  }, [filteredProducts, activeStoreIds, searchQuery, activeCategory, allProducts]);

  const handleQuantityChange = (productId: string, newQuantity: number, previousQuantity: number) => {
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
      categories={nonEmptyCategories.length > 0 ? nonEmptyCategories : categories}
      activeCategory={activeCategory}
      onCategorySelect={handleCategorySelect}
      products={filteredProducts}
      allCategoryNames={allCategoryNames}
      onQuantityChange={handleQuantityChange}
      viewMode={viewMode}
    />
  );
};
