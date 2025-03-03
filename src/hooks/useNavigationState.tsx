
import { useState, useEffect } from "react";
import { NavItem } from "@/components/BottomNav";

export interface CartItem {
  id: string;
  name: string;
  details: string;
  quantity: number;
  price: string;
  checked: boolean;
  image?: string;
}

export const useNavigationState = (initialCartCount: number = 0) => {
  const [cartCount, setCartCount] = useState(initialCartCount);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  
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
  const handleProductQuantityChange = (productId: string, newQuantity: number, previousQuantity: number, productDetails?: {
    name: string;
    details: string;
    price: string;
    image?: string;
  }) => {
    // Update cart count
    const quantityDifference = newQuantity - previousQuantity;
    setCartCount(prev => Math.max(0, prev + quantityDifference));
    
    // Update cart items
    setCartItems(prev => {
      // Find if product already exists in cart
      const existingItemIndex = prev.findIndex(item => item.id === productId);
      
      // If quantity is 0, remove item from cart
      if (newQuantity === 0 && existingItemIndex !== -1) {
        return prev.filter(item => item.id !== productId);
      }
      
      // If item exists, update quantity
      if (existingItemIndex !== -1) {
        return prev.map((item, index) => 
          index === existingItemIndex 
            ? { ...item, quantity: newQuantity }
            : item
        );
      }
      
      // If item is new and we have details, add it to cart
      if (productDetails && newQuantity > 0) {
        return [...prev, {
          id: productId,
          name: productDetails.name,
          details: productDetails.details,
          quantity: newQuantity,
          price: productDetails.price,
          checked: false,
          image: productDetails.image
        }];
      }
      
      return prev;
    });
  };

  // Handle item checked status
  const handleItemCheck = (id: string) => {
    setCartItems(prev =>
      prev.map(item =>
        item.id === id ? { ...item, checked: !item.checked } : item
      )
    );
  };

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
