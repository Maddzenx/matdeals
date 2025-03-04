
import { useCallback } from "react";
import { Product, CategoryData, productsData } from "@/data/productData";

export const useProductUtils = (categories: CategoryData[]) => {
  // Transform products to include category information
  const getProductsWithCategories = useCallback(() => {
    const result: Product[] = [];
    
    Object.entries(productsData).forEach(([categoryId, categoryProducts]) => {
      const categoryName = categories.find(c => c.id === categoryId)?.name || "";
      categoryProducts.forEach(product => {
        result.push({
          ...product,
          category: categoryName
        });
      });
    });
    
    return result;
  }, [categories]);

  // Get non-empty categories
  const getNonEmptyCategories = useCallback(() => {
    return categories.filter(category => {
      const categoryProducts = productsData[category.id] || [];
      return categoryProducts.length > 0;
    });
  }, [categories]);

  // Get all category names from the non-empty categories
  const getAllCategoryNames = useCallback(() => {
    const nonEmptyCategories = getNonEmptyCategories();
    return nonEmptyCategories.map(category => category.name);
  }, [getNonEmptyCategories]);

  // Scroll to a category when it's selected
  const scrollToCategory = useCallback((categoryId: string) => {
    const categoryName = categories.find(c => c.id === categoryId)?.name || "";
    const element = document.getElementById(categoryName);
    if (element) {
      // Get header height (CategoryTabs + other fixed elements)
      const headerHeight = 105 + 48; // 105px from the top sticky positioning + ~48px for the tabs
      
      // Calculate the position to scroll to
      const elementPosition = element.getBoundingClientRect().top + window.scrollY;
      const offsetPosition = elementPosition - headerHeight;
      
      // Scroll to the element with the offset
      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  }, [categories]);

  return {
    getProductsWithCategories,
    scrollToCategory,
    getAllCategoryNames,
    getNonEmptyCategories
  };
};
