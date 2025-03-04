
import { useMemo } from "react";
import { CartItem } from "@/hooks/useNavigationState";

export const useStoreGrouping = (cartItems: CartItem[]) => {
  const groupedByStore = useMemo(() => {
    // Debug the incoming cart items to check their store properties
    console.log("Grouping cart items:", cartItems.map(item => ({ id: item.id, store: item.store })));
    
    return cartItems.reduce((acc, item) => {
      // Use the item's store property, and only default to "Övriga produkter" if it's explicitly undefined or empty
      const storeName = item.store && item.store.trim() !== "" ? item.store : "Övriga produkter";
      
      if (!acc[storeName]) {
        acc[storeName] = [];
      }
      acc[storeName].push(item);
      return acc;
    }, {} as Record<string, typeof cartItems>);
  }, [cartItems]);

  const sortedStoreNames = useMemo(() => {
    // Log the store names found
    console.log("Store names found:", Object.keys(groupedByStore));
    
    // Ensure "Övriga produkter" always appears last
    return Object.keys(groupedByStore).sort((a, b) => {
      if (a === "Övriga produkter") return 1;
      if (b === "Övriga produkter") return -1;
      return a.localeCompare(b);
    });
  }, [groupedByStore]);

  return { groupedByStore, sortedStoreNames };
};
