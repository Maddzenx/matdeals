
import { useCartState } from "./useCartState";
import { useNavItems } from "./useNavItems";

// Re-export CartItem type using 'export type'
export type { CartItem } from "./useCartState";

export const useNavigationState = (initialCartCount: number = 0) => {
  const {
    cartCount,
    setCartCount,
    cartItems,
    setCartItems,
    handleProductQuantityChange,
    handleItemCheck
  } = useCartState(initialCartCount);
  
  const { navItems, setNavItems } = useNavItems(cartCount);

  return {
    navItems,
    setNavItems,
    cartCount,
    setCartCount,
    cartItems,
    setCartItems,
    handleProductQuantityChange,
    handleItemCheck
  };
};
