
import { useState, useCallback } from "react";

export const useRecipeActions = () => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  
  // Function to handle dropdown open state
  const handleDropdownChange = useCallback((open: boolean) => {
    setIsDropdownOpen(open);
  }, []);

  // Handle adding to meal plan without toast notification
  const handleAddToMealPlanWithToast = useCallback((day: string, recipeId: string, addToMealPlan: (day: string, recipeId: string) => void) => {
    addToMealPlan(day, recipeId);
    
    // Manually close dropdown after action
    setIsDropdownOpen(false);
  }, []);

  // Handle add to cart without toast notification
  const handleAddToCartWithToast = useCallback((recipe: any, handleProductQuantityChange: any) => {
    if (recipe && recipe.matchedProducts && recipe.matchedProducts.length > 0) {
      recipe.matchedProducts.forEach((product: any) => {
        handleProductQuantityChange(
          product.id,
          1,
          0,
          {
            name: product.name,
            details: product.details,
            price: product.currentPrice,
            image: product.image,
            store: product.store,
            recipeId: recipe.id,
            recipeTitle: recipe.title
          }
        );
      });
      
      // Manually close dropdown after action
      setIsDropdownOpen(false);
    }
  }, []);

  return {
    isDropdownOpen,
    handleDropdownChange,
    handleAddToMealPlanWithToast,
    handleAddToCartWithToast
  };
};
