
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

  // Get all category names from the categories array
  const getAllCategoryNames = useCallback(() => {
    return categories.map(category => category.name);
  }, [categories]);

  // Scroll to a category when it's selected
  const scrollToCategory = useCallback((categoryId: string) => {
    const categoryName = categories.find(c => c.id === categoryId)?.name || "";
    const element = document.getElementById(categoryName);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  }, [categories]);

  return {
    getProductsWithCategories,
    scrollToCategory,
    getAllCategoryNames
  };
};
