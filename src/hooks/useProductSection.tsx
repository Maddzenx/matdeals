import { useState, useEffect, useMemo } from "react";
import { Product, CategoryData } from "@/data/types";

export function useProductSection(
  categories: CategoryData[],
  products: Product[],
  activeStoreIds: string[] = [],
  storeTags: { id: string; name: string }[] = [],
  searchQuery: string = ''
) {
  const [activeCategory, setActiveCategory] = useState<string>("all");
  
  // Filter products by active store tags if any are selected
  const storeFilteredProducts = activeStoreIds.length > 0
    ? products.filter(product => activeStoreIds.includes(product.store.toLowerCase()))
    : products;
  
  // Apply search filter if a query is provided
  const searchFilteredProducts = searchQuery.length > 0
    ? storeFilteredProducts.filter(product => {
        const searchLower = searchQuery.toLowerCase();
        return (
          product.name?.toLowerCase().includes(searchLower) ||
          product.description?.toLowerCase().includes(searchLower) ||
          product.category?.toLowerCase().includes(searchLower) ||
          (product.details && product.details.toLowerCase().includes(searchLower))
        );
      })
    : storeFilteredProducts;
  
  // Filter products by active stores and search query
  const filteredProducts = useMemo(() => {
    console.log("Filtering products:", products.length);
    console.log("Active store IDs:", activeStoreIds);
    
    // Convert active store IDs to lowercase for case-insensitive comparison
    const lowerCaseActiveStores = activeStoreIds.map(store => store.toLowerCase());
    
    // Filter by active stores - case insensitive
    let filtered = searchFilteredProducts.filter(product => {
      // Ensure the product has a store property and convert to lowercase
      const productStore = (product.store || '').toLowerCase();
      
      // Check if this store is in our active stores list
      const isIncluded = lowerCaseActiveStores.includes(productStore);
      
      if (!isIncluded) {
        console.log(`Product with store "${productStore}" filtered out because it's not in active stores:`, lowerCaseActiveStores);
      }
      
      return isIncluded;
    });
    
    console.log("After store filtering:", filtered.length, "products remaining");
    
    // Create a breakdown of the filtered products by store
    const storeCount = filtered.reduce((acc, product) => {
      const store = (product.store || '').toLowerCase() || 'unknown';
      acc[store] = (acc[store] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
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
}
