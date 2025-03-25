
import { useState, useEffect, useMemo } from "react";
import { Product, CategoryData } from "@/data/types";

export const useProductSection = (
  categories: CategoryData[],
  products: Product[],
  activeStoreIds: string[],
  storeTags: { id: string; name: string }[],
  searchQuery: string = ""
) => {
  const [activeCategory, setActiveCategory] = useState("all");

  // Filter products by active stores and search query
  const filteredProducts = useMemo(() => {
    console.log("Filtering products:", products.length);
    console.log("Active store IDs:", activeStoreIds);
    
    // Filter by active stores - make this case insensitive
    let filtered = products.filter(product => {
      // Ensure the product has a store property and it's in the active stores list (case insensitive)
      const productStore = product.store?.toLowerCase();
      
      // Debug store information
      if (!productStore) {
        console.log("Product without store property:", product.name);
        return false;
      }
      
      // Check if any activeStoreId matches the product store (case insensitive)
      const isIncluded = activeStoreIds.some(storeId => 
        productStore === storeId.toLowerCase()
      );
      
      if (!isIncluded) {
        console.log(`Product with store "${productStore}" filtered out because it's not in active stores:`, activeStoreIds);
      }
      
      return isIncluded;
    });
    
    console.log("After store filtering:", filtered.length, "products remaining");
    
    // Filter by search query if provided
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        product => 
          product.name.toLowerCase().includes(query) ||
          (product.details && product.details.toLowerCase().includes(query))
      );
      console.log("After search filtering:", filtered.length, "products remaining");
    }
    
    // Create a breakdown of the filtered products by store
    const storeCount = filtered.reduce((acc, product) => {
      const store = product.store?.toLowerCase() || 'unknown';
      acc[store] = (acc[store] || 0) + 1;
      return acc;
    }, {});
    
    console.log("Filtered products by store:", storeCount);
    
    return filtered;
  }, [products, activeStoreIds, searchQuery]);

  // Get all unique category names from products
  const allCategoryNames = useMemo(() => {
    const uniqueCategories = new Set<string>();
    filteredProducts.forEach(product => {
      if (product.category) {
        uniqueCategories.add(product.category);
      }
    });
    return Array.from(uniqueCategories);
  }, [filteredProducts]);

  // Create categories that actually have products
  const nonEmptyCategories = useMemo(() => {
    // Start with the "All" category
    const allCategory = categories.find(c => c.id === "all") || { id: "all", name: "All" };
    
    // Filter other categories to only include those with products
    const categoriesWithProducts = categories
      .filter(category => 
        category.id === "all" || 
        allCategoryNames.includes(category.id) ||
        filteredProducts.some(product => product.category === category.id)
      );
    
    // If "All" isn't already in the list, add it at the beginning
    if (!categoriesWithProducts.some(c => c.id === "all")) {
      return [allCategory, ...categoriesWithProducts];
    }
    
    console.log("Categories with products:", categoriesWithProducts.map(c => c.name));
    
    return categoriesWithProducts;
  }, [categories, filteredProducts, allCategoryNames]);

  // Handle category selection
  const handleCategorySelect = (categoryId: string) => {
    console.log(`Category changed to: ${categoryId}`);
    setActiveCategory(categoryId);
  };

  // If the active category has no products, switch to "all"
  useEffect(() => {
    if (activeCategory !== "all" && 
        !allCategoryNames.includes(activeCategory) && 
        !filteredProducts.some(p => p.category === activeCategory)) {
      console.log(`Active category ${activeCategory} has no products, switching to 'all'`);
      setActiveCategory("all");
    }
  }, [activeCategory, filteredProducts, allCategoryNames]);

  // Create categories from products if there are products without known categories
  useEffect(() => {
    if (allCategoryNames.length > 0) {
      console.log("Created categories from products:", allCategoryNames);
    }
  }, [allCategoryNames]);

  return {
    filteredProducts,
    activeCategory,
    nonEmptyCategories,
    allCategoryNames,
    handleCategorySelect
  };
};
