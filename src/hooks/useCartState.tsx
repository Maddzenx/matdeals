
import { useState, useEffect, useCallback } from "react";

export interface CartItem {
  id: string;
  name: string;
  details: string;
  quantity: number;
  price: string;
  checked: boolean;
  image?: string;
  store?: string;
  recipeId?: string;
  recipeTitle?: string;
}

// Create a singleton instance to share state across components
let globalCartItems: CartItem[] = [];
let globalCartCount = 0;
let subscribers: (() => void)[] = [];

const notifySubscribers = () => {
  subscribers.forEach(callback => callback());
};

export const useCartState = (initialCartCount: number = 0) => {
  const [cartCount, setCartCount] = useState(globalCartCount || initialCartCount);
  const [cartItems, setCartItems] = useState<CartItem[]>(globalCartItems);

  // Subscribe to global changes
  useEffect(() => {
    const handleChange = () => {
      setCartItems([...globalCartItems]);
      setCartCount(globalCartCount);
    };
    
    subscribers.push(handleChange);
    
    // Initial sync
    handleChange();
    
    return () => {
      subscribers = subscribers.filter(sub => sub !== handleChange);
    };
  }, []);

  // Handle product quantity changes
  const handleProductQuantityChange = useCallback((
    productId: string, 
    newQuantity: number, 
    previousQuantity: number, 
    productDetails?: {
      name: string;
      details: string;
      price: string;
      image?: string;
      store?: string;
      recipeId?: string;
      recipeTitle?: string;
    }
  ) => {
    // Update cart items
    let updatedCartItems = [...globalCartItems];
    
    // Find if product already exists in cart
    const existingItemIndex = updatedCartItems.findIndex(item => item.id === productId);
    
    // If quantity is 0, remove item from cart
    if (newQuantity === 0 && existingItemIndex !== -1) {
      updatedCartItems = updatedCartItems.filter(item => item.id !== productId);
    } 
    // If item exists, update quantity AND ensure store information is preserved
    else if (existingItemIndex !== -1) {
      updatedCartItems = updatedCartItems.map((item, index) => 
        index === existingItemIndex 
          ? { 
              ...item, 
              quantity: newQuantity,
              // Always use productDetails properties if available
              store: productDetails?.store || item.store,
              recipeId: productDetails?.recipeId || item.recipeId,
              recipeTitle: productDetails?.recipeTitle || item.recipeTitle
            }
          : item
      );
    } 
    // If item is new and we have details, add it to cart
    else if (productDetails && newQuantity > 0) {
      const newItem = {
        id: productId,
        name: productDetails.name,
        details: productDetails.details,
        quantity: newQuantity,
        price: productDetails.price,
        checked: false,
        image: productDetails.image,
        store: productDetails.store,
        recipeId: productDetails.recipeId,
        recipeTitle: productDetails.recipeTitle
      };
      
      updatedCartItems = [...updatedCartItems, newItem];
    }
    
    // Update global state
    globalCartItems = updatedCartItems;
    globalCartCount = updatedCartItems.reduce((total, item) => total + item.quantity, 0);
    
    // Update local state
    setCartItems(updatedCartItems);
    setCartCount(globalCartCount);
    
    // Notify all subscribers
    notifySubscribers();
  }, []);

  // Handle item checked status
  const handleItemCheck = useCallback((id: string) => {
    const updatedCartItems = globalCartItems.map(item =>
      item.id === id ? { ...item, checked: !item.checked } : item
    );
    
    // Update global state
    globalCartItems = updatedCartItems;
    
    // Update local state
    setCartItems(updatedCartItems);
    
    // Notify all subscribers
    notifySubscribers();
  }, []);

  return {
    cartCount,
    setCartCount,
    cartItems,
    setCartItems,
    handleProductQuantityChange,
    handleItemCheck
  };
};
