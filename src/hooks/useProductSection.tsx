
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
  
  // Add category for "all"
  const allCategory = { id: "all", name: "All" };
  
  // Get non-empty categories and ensure they're not empty
  let nonEmptyCategories = getNonEmptyCategories();
  
  // If no products are in the local data, use supabase product categories
  if (nonEmptyCategories.length === 0 && allProducts.length > 0) {
    // Extract categories from products
    const uniqueCategories = [...new Set(allProducts.map(p => p.category))].filter(Boolean);
    
    // Map to proper CategoryData format
    nonEmptyCategories = uniqueCategories.map(catName => {
      // Find existing category or create new one
      const existingCat = categories.find(c => c.id === catName || c.name === catName);
      if (existingCat) return existingCat;
      
      // Create new category
      return {
        id: catName || 'other',
        name: catName || 'Other'
      };
    });
    
    console.log("Created categories from products:", nonEmptyCategories);
  }
  
  // Ensure "all" category is first
  nonEmptyCategories = [allCategory, ...nonEmptyCategories.filter(c => c.id !== 'all')];
  
  const [activeCategory, setActiveCategory] = useState('all'); // Start with 'all' as default
  const scrolledToCategoryRef = useRef(false);
  const initialScrollRef = useRef(false);
  
  const allCategoryNames = getAllCategoryNames();

  useEffect(() => {
    if (nonEmptyCategories.length > 0 && !nonEmptyCategories.some(c => c.id === activeCategory)) {
      setActiveCategory('all');
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
    const storeMatch = activeStoreIds.length === 0 || activeStoreIds.some(storeId => {
      // Check for lowercase store values for ICA and Willys
      const productStore = product.store?.toLowerCase() || '';
      
      if (productStore === 'ica' && storeId === 'ica') return true;
      if (productStore === 'willys' && storeId === 'willys') return true;
      
      // For other stores, match based on the tag name/id
      const storeTag = storeTags.find(tag => tag.name.toLowerCase() === productStore);
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
  
  // Log filtered products by store for debugging
  const storeCount = filteredProducts.reduce((acc, product) => {
    const store = product.store?.toLowerCase() || 'unknown';
    acc[store] = (acc[store] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  console.log("Filtered products by store:", storeCount);

  // Log first few filtered products for debugging
  if (filteredProducts.length > 0) {
    console.log("First few filtered products:", filteredProducts.slice(0, 3).map(p => ({
      id: p.id,
      name: p.name,
      store: p.store,
      category: p.category
    })));
  } else {
    console.warn("No products found after filtering!");
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
