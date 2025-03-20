
import { useState, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";

export const useRecipeActions = () => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const { toast } = useToast();
  
  // Function to handle dropdown open state
  const handleDropdownChange = useCallback((open: boolean) => {
    setIsDropdownOpen(open);
  }, []);

  // Handle adding to meal plan with toast notification
  const handleAddToMealPlanWithToast = useCallback((day: string, recipeId: string, addToMealPlan: (day: string, recipeId: string) => void) => {
    addToMealPlan(day, recipeId);
    
    // Add toast notification
    toast({
      title: "Tillagd i matsedel",
      description: `Receptet har lagts till i matsedeln.`,
    });
    
    // Manually close dropdown after action
    setIsDropdownOpen(false);
  }, [toast]);

  // Handle add to cart with toast notification
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
      
      // Add toast notification
      toast({
        title: "Tillagd i inköpslistan",
        description: `Ingredienser från "${recipe.title}" har lagts till i inköpslistan.`,
      });
      
      // Manually close dropdown after action
      setIsDropdownOpen(false);
    } else {
      // Show different toast if no products to add
      toast({
        title: "Inga ingredienser att lägga till",
        description: "Det finns inga matchande produkter för detta recept.",
        variant: "destructive"
      });
    }
  }, [toast]);

  return {
    isDropdownOpen,
    handleDropdownChange,
    handleAddToMealPlanWithToast,
    handleAddToCartWithToast
  };
};
