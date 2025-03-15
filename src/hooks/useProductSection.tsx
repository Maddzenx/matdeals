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

  const filteredProducts = allProducts.filter(product => {
    const storeTag = storeTags.find(tag => tag.name === product.store);
    const storeMatch = storeTag && activeStoreIds.includes(storeTag.id);
    
    if (product.store === 'ICA') {
      const icaInActiveStores = activeStoreIds.includes('ica');
      if (icaInActiveStores) {
        if (!searchQuery) return true;
        
        const query = searchQuery.toLowerCase();
        return (
          product.name.toLowerCase().includes(query) || 
          product.details.toLowerCase().includes(query) ||
          (product.category && product.category.toLowerCase().includes(query))
        );
      }
      return false;
    }
    
    if (product.store === 'Willys') {
      const willysInActiveStores = activeStoreIds.includes('willys');
      if (willysInActiveStores) {
        if (!searchQuery) return true;
        
        const query = searchQuery.toLowerCase();
        return (
          product.name.toLowerCase().includes(query) || 
          product.details.toLowerCase().includes(query) ||
          (product.category && product.category.toLowerCase().includes(query))
        );
      }
      return false;
    }
    
    if (!searchQuery) return storeMatch;
    
    const query = searchQuery.toLowerCase();
    return storeMatch && (
      product.name.toLowerCase().includes(query) || 
      product.details.toLowerCase().includes(query) ||
      (product.category && product.category.toLowerCase().includes(query))
    );
  });

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
