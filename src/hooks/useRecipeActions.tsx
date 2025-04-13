import { useState, useCallback } from "react";
import { Product } from "@/data/types";
import { Recipe } from "@/types/recipe";

interface ProductQuantityChangeHandler {
  (productId: string, quantity: number, previousQuantity: number, productDetails: { name: string; details?: string }): void;
}

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
  const handleAddToCartWithToast = useCallback((recipe: Recipe, handleProductQuantityChange: ProductQuantityChangeHandler) => {
    if (recipe && recipe.matchedProducts && recipe.matchedProducts.length > 0) {
      recipe.matchedProducts.forEach((product: Product) => {
        handleProductQuantityChange(
          product.id,
          1,
          0,
          {
            name: product.name,
            details: product.details,
          }
        );
      });
    }
    
    // Manually close dropdown after action
    setIsDropdownOpen(false);
  }, []);

  return {
    isDropdownOpen,
    handleDropdownChange,
    handleAddToMealPlanWithToast,
    handleAddToCartWithToast,
  };
};
