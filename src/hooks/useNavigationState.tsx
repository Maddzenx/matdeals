
import { useCartState, CartItem } from "./useCartState";
import { useNavItems } from "./useNavItems";

export { CartItem };

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
