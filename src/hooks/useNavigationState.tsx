import { useState, useEffect, useCallback } from "react";
import { NavItem } from "@/components/BottomNav";

export interface CartItem {
  id: string;
  name: string;
  details: string;
  quantity: number;
  price: string;
  checked: boolean;
  image?: string;
  store?: string;
}

// Create a singleton instance to share state across components
let globalCartItems: CartItem[] = [];
let globalCartCount = 0;
let subscribers: (() => void)[] = [];

const notifySubscribers = () => {
  subscribers.forEach(callback => callback());
};

export const useNavigationState = (initialCartCount: number = 0) => {
  const [cartCount, setCartCount] = useState(globalCartCount || initialCartCount);
  const [cartItems, setCartItems] = useState<CartItem[]>(globalCartItems);
  
  const [navItems, setNavItems] = useState<NavItem[]>([
    { id: "offers", icon: "discount", label: "Erbjudanden", active: true },
    { id: "recipes", icon: "book", label: "Recept" },
    { id: "menu", icon: "search", label: "Matsedel" },
    { id: "cart", icon: "shopping-cart", label: "Inköpslista" },
    { id: "profile", icon: "user", label: "Profil" },
  ]);

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
    // If item exists, update quantity
    else if (existingItemIndex !== -1) {
      updatedCartItems = updatedCartItems.map((item, index) => 
        index === existingItemIndex 
          ? { ...item, quantity: newQuantity }
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
        store: productDetails.store
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
