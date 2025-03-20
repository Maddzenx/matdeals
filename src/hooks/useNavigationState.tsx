
import { useEffect } from "react";
import { useNavItems } from "./useNavItems";
import { useCartState, CartItem } from "./useCartState";

export const useNavigationState = () => {
  const { 
    cartItems, 
    cartCount, 
    setCartCount,
    setCartItems,
    handleProductQuantityChange,
    handleItemCheck
  } = useCartState();
  
  const { navItems, setNavItems } = useNavItems(cartItems);

  return { 
    navItems, 
    setNavItems,
    cartItems,
    cartCount,
    setCartCount,
    setCartItems,
    handleProductQuantityChange,
    handleItemCheck
  };
};

// Re-export CartItem type for convenience
export type { CartItem } from "./useCartState";
