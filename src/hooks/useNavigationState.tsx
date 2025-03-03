
import { useState, useEffect } from "react";
import { NavItem } from "@/components/BottomNav";

export const useNavigationState = (initialCartCount: number = 0) => {
  const [cartCount, setCartCount] = useState(initialCartCount);
  
  const [navItems, setNavItems] = useState<NavItem[]>([
    { id: "offers", icon: "discount", label: "Erbjudanden", active: true },
    { id: "recipes", icon: "book", label: "Recept" },
    { id: "menu", icon: "search", label: "Matsedel" },
    { id: "cart", icon: "shopping-cart", label: "Inköpslista" },
    { id: "profile", icon: "user", label: "Profil" },
  ]);

  // Update nav items when cart count changes
  useEffect(() => {
    setNavItems(prev => 
      prev.map(item => 
        item.id === "cart" 
          ? { ...item, badge: cartCount > 0 ? cartCount : undefined } 
          : item
      )
    );
  }, [cartCount]);

  // Handle product quantity changes
  const handleProductQuantityChange = (productId: string, newQuantity: number, previousQuantity: number) => {
    const quantityDifference = newQuantity - previousQuantity;
    setCartCount(prev => Math.max(0, prev + quantityDifference));
  };

  return {
    navItems,
    setNavItems,
    cartCount,
    setCartCount,
    handleProductQuantityChange
  };
};
