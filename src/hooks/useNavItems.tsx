
import { useState, useEffect } from "react";
import { NavItem } from "@/components/BottomNav";
import { useLocation } from "react-router-dom";

export const useNavItems = (cartCount: number) => {
  const location = useLocation();
  
  const [navItems, setNavItems] = useState<NavItem[]>([
    { id: "offers", icon: "discount", label: "Erbjudanden", active: false },
    { id: "recipes", icon: "book", label: "Recept", active: false },
    { id: "menu", icon: "search", label: "Matsedel", active: false },
    { id: "cart", icon: "shopping-cart", label: "Inköpslista", active: false },
    { id: "profile", icon: "user", label: "Profil", active: false },
  ]);

  // Update active tab based on current route
  useEffect(() => {
    const path = location.pathname;
    const updatedItems = navItems.map(item => {
      if (path === "/" && item.id === "offers") {
        return { ...item, active: true };
      }
      if (path === "/recipes" && item.id === "recipes") {
        return { ...item, active: true };
      }
      if (path === "/shopping-list" && item.id === "cart") {
        return { ...item, active: true };
      }
      if (path === "/auth" && item.id === "profile") {
        return { ...item, active: true };
      }
      return { ...item, active: false };
    });
    setNavItems(updatedItems);
  }, [location.pathname]);

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
