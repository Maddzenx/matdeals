
import { useState, useEffect } from "react";
import { NavItem } from "@/components/BottomNav";

export const useNavItems = (cartCount: number) => {
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

  return { navItems, setNavItems };
};
