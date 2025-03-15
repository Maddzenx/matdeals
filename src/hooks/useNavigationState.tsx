
import { useEffect } from "react";
import { useNavItems } from "./useNavItems";
import { useCartState } from "./useCartState";

export const useNavigationState = () => {
  const { cartItems } = useCartState();
  const { navItems, setNavItems } = useNavItems(cartItems.length);

  return { navItems, setNavItems };
};
