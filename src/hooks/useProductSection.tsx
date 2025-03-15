
import { useState, useEffect, useRef } from "react";
import { CategoryData, Product } from "@/data/types";
import { useProductUtils } from "@/hooks/useProductUtils";

export const useProductSection = (
  categories: CategoryData[],
  allProducts: Product[],
  activeStoreIds: string[],
  storeTags: { id: string; name: string }[],
  searchQuery: string
) => {
  const { 
    getProductsWithCategories, 
    scrollToCategory, 
    getAllCategoryNames,
    getNonEmptyCategories
  } = useProductUtils(categories);
  
  const nonEmptyCategories = getNonEmptyCategories();
  const [activeCategory, setActiveCategory] = useState(nonEmptyCategories.length > 0 ? nonEmptyCategories[0].id : "");
  const scrolledToCategoryRef = useRef(false);
  const initialScrollRef = useRef(false);
  
  const allCategoryNames = getAllCategoryNames();

  useEffect(() => {
    if (nonEmptyCategories.length > 0 && !nonEmptyCategories.some(c => c.id === activeCategory)) {
      setActiveCategory(nonEmptyCategories[0].id);
    }
  }, [nonEmptyCategories, activeCategory]);

  useEffect(() => {
    if (!initialScrollRef.current && activeCategory && nonEmptyCategories.length > 0) {
      const timer = setTimeout(() => {
        scrollToCategory(activeCategory);
        initialScrollRef.current = true;
      }, 300);
      
      return () => clearTimeout(timer);
    }
  }, [activeCategory, nonEmptyCategories, scrollToCategory]);

  useEffect(() => {
    const handleScroll = () => {
      if (scrolledToCategoryRef.current) {
        scrolledToCategoryRef.current = false;
        return;
      }

      const categoryElements = allCategoryNames.map(name => document.getElementById(name));
      
      const validElements = categoryElements
        .filter(el => el !== null)
        .map(el => ({
          id: nonEmptyCategories.find(c => c.name === el?.id)?.id || "",
          position: el!.getBoundingClientRect().top
        }));

      const headerHeight = 120;

      const closestElement = validElements
        .filter(el => el.position <= headerHeight + 100)
        .sort((a, b) => b.position - a.position)[0];

      if (closestElement && closestElement.id !== activeCategory) {
        setActiveCategory(closestElement.id);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [allCategoryNames, nonEmptyCategories, activeCategory]);

  // Log activeStoreIds and storeTags for debugging
  useEffect(() => {
    console.log("Active store IDs:", activeStoreIds);
    console.log("Store tags:", storeTags);
  }, [activeStoreIds, storeTags]);

  const filteredProducts = allProducts.filter(product => {
    // Match based on store ID
    const storeMatch = activeStoreIds.some(storeId => {
      // Special handling for ICA and Willys stores
      if (product.store === 'ICA' && storeId === 'ica') return true;
      if (product.store === 'Willys' && storeId === 'willys') return true;
      
      // Find matching store tag (for other stores)
      const storeTag = storeTags.find(tag => tag.name === product.store);
      return storeTag && storeId === storeTag.id;
    });
    
    if (!storeMatch) {
      return false;
    }
    
    // If we have a search query, filter by it
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const matchesSearch = 
        product.name.toLowerCase().includes(query) || 
        product.details.toLowerCase().includes(query) ||
        (product.category && product.category.toLowerCase().includes(query));
      
      return matchesSearch;
    }
    
    // If no search query and store matches, include product
    return true;
  });

  console.log(`Found ${filteredProducts.length} products after filtering from ${allProducts.length} total products`);
  
  // Log first few filtered products for debugging
  if (filteredProducts.length > 0) {
    console.log("First few filtered products:", filteredProducts.slice(0, 3));
  }

  const handleCategorySelect = (categoryId: string) => {
    setActiveCategory(categoryId);
    scrolledToCategoryRef.current = true;
    scrollToCategory(categoryId);
  };

  return {
    filteredProducts,
    activeCategory,
    nonEmptyCategories,
    allCategoryNames,
    handleCategorySelect
  };
};
