
import { useCallback } from "react";
import { CartItem } from "@/hooks/useCartState";

interface UseProductHandlerProps {
  cartItems: CartItem[];
  handleProductQuantityChange: (
    id: string, 
    newQuantity: number, 
    previousQuantity: number, 
    productDetails?: any
  ) => void;
  handleItemCheck: (id: string) => void;
}

export const useProductHandler = ({
  cartItems,
  handleProductQuantityChange,
  handleItemCheck
}: UseProductHandlerProps) => {
  const handleIncrement = useCallback((id: string) => {
    const item = cartItems.find(item => item.id === id);
    if (item) {
      handleProductQuantityChange(
        id, 
        item.quantity + 1, 
        item.quantity,
        {
          name: item.name,
          details: item.details,
          price: item.price,
          image: item.image,
          store: item.store,
          recipeId: item.recipeId,
          recipeTitle: item.recipeTitle
        }
      );
    }
  }, [cartItems, handleProductQuantityChange]);

  const handleDecrement = useCallback((id: string) => {
    const item = cartItems.find(item => item.id === id);
    if (item && item.quantity > 0) {
      handleProductQuantityChange(
        id, 
        Math.max(0, item.quantity - 1), 
        item.quantity,
        {
          name: item.name,
          details: item.details,
          price: item.price,
          image: item.image,
          store: item.store,
          recipeId: item.recipeId,
          recipeTitle: item.recipeTitle
        }
      );
    }
  }, [cartItems, handleProductQuantityChange]);

  const handleSetQuantity = useCallback((id: string, newQuantity: number) => {
    const item = cartItems.find(item => item.id === id);
    if (item) {
      handleProductQuantityChange(
        id, 
        newQuantity, 
        item.quantity,
        {
          name: item.name,
          details: item.details,
          price: item.price,
          image: item.image,
          store: item.store,
          recipeId: item.recipeId,
          recipeTitle: item.recipeTitle
        }
      );
    }
  }, [cartItems, handleProductQuantityChange]);

  return {
    handleIncrement,
    handleDecrement,
    handleSetQuantity,
    handleItemCheck
  };
};
