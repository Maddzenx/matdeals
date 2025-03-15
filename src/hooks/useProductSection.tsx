
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

  // Set initial active category when non-empty categories change
  useEffect(() => {
    if (nonEmptyCategories.length > 0 && !nonEmptyCategories.some(c => c.id === activeCategory)) {
      setActiveCategory(nonEmptyCategories[0].id);
    }
  }, [nonEmptyCategories, activeCategory]);

  // Initial scroll to active category
  useEffect(() => {
    if (!initialScrollRef.current && activeCategory && nonEmptyCategories.length > 0) {
      // Set timeout to ensure DOM is ready
      const timer = setTimeout(() => {
        scrollToCategory(activeCategory);
        initialScrollRef.current = true;
      }, 300);
      
      return () => clearTimeout(timer);
    }
  }, [activeCategory, nonEmptyCategories, scrollToCategory]);

  // Setup scroll event to update active category based on scroll position
  useEffect(() => {
    const handleScroll = () => {
      // Don't trigger if we just programmatically scrolled to a category
      if (scrolledToCategoryRef.current) {
        scrolledToCategoryRef.current = false;
        return;
      }

      // Find all category elements in the DOM
      const categoryElements = allCategoryNames.map(name => document.getElementById(name));
      
      // Filter out null elements and get their positions
      const validElements = categoryElements
        .filter(el => el !== null)
        .map(el => ({
          id: nonEmptyCategories.find(c => c.name === el?.id)?.id || "",
          position: el!.getBoundingClientRect().top
        }));

      // Get the header height (adjust this value based on your fixed header height)
      const headerHeight = 120;

      // Find the element closest to the top of the viewport (after the header)
      const closestElement = validElements
        .filter(el => el.position <= headerHeight + 100) // Add more threshold for better detection
        .sort((a, b) => b.position - a.position)[0];

      if (closestElement && closestElement.id !== activeCategory) {
        setActiveCategory(closestElement.id);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [allCategoryNames, nonEmptyCategories, activeCategory]);

  // Filter products based on active store IDs and search query
  const filteredProducts = allProducts.filter(product => {
    // First filter by store
    const storeTag = storeTags.find(tag => tag.name === product.store);
    const storeMatch = storeTag && activeStoreIds.includes(storeTag.id);
    
    // Special case for ICA products from Supabase
    if (product.store === 'ICA') {
      const icaInActiveStores = activeStoreIds.includes('ica');
      if (icaInActiveStores) {
        // If search query is provided, filter by it
        if (!searchQuery) return true;
        
        // Case-insensitive search in product name, details, and category
        const query = searchQuery.toLowerCase();
        return (
          product.name.toLowerCase().includes(query) || 
          product.details.toLowerCase().includes(query) ||
          (product.category && product.category.toLowerCase().includes(query))
        );
      }
      return false;
    }
    
    // Regular case for other stores
    // Then filter by search query if provided
    if (!searchQuery) return storeMatch;
    
    // Case-insensitive search in product name, details, and category
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
