
import { useCallback } from "react";
import { useCartState, CartItem } from "./useCartState";

export interface ShoppingCartProduct {
  id: string;
  name: string;
  price: number;
  image?: string;
  quantity: number;
  checked: boolean;
  store?: string;
  recipeId?: string;
  recipeTitle?: string;
}

export function useCart() {
  const { cartItems, handleProductQuantityChange } = useCartState();
  
  const addProduct = useCallback((product: ShoppingCartProduct) => {
    const productDetails = {
      name: product.name,
      details: product.store || "",
      price: product.price.toString(),
      image: product.image,
      store: product.store,
      recipeId: product.recipeId,
      recipeTitle: product.recipeTitle
    };
    
    // Use handleProductQuantityChange to add the product to the cart
    handleProductQuantityChange(
      product.id,
      product.quantity,
      0, // Previous quantity (0 for new items)
      productDetails
    );
  }, [handleProductQuantityChange]);
  
  const removeProduct = useCallback((productId: string) => {
    handleProductQuantityChange(productId, 0, 1);
  }, [handleProductQuantityChange]);
  
  const updateProductQuantity = useCallback((productId: string, quantity: number) => {
    const existingItem = cartItems.find(item => item.id === productId);
    if (existingItem) {
      handleProductQuantityChange(
        productId, 
        quantity, 
        existingItem.quantity
      );
    }
  }, [cartItems, handleProductQuantityChange]);
  
  return {
    cartItems,
    addProduct,
    removeProduct,
    updateProductQuantity
  };
}
