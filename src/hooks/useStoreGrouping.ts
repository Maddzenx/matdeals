
import { useMemo } from "react";
import { CartItem } from "@/hooks/useNavigationState";

export const useStoreGrouping = (cartItems: CartItem[]) => {
  const groupedByStore = useMemo(() => {
    return cartItems.reduce((acc, item) => {
      const storeName = item.store || "Övriga produkter";
      if (!acc[storeName]) {
        acc[storeName] = [];
      }
      acc[storeName].push(item);
      return acc;
    }, {} as Record<string, typeof cartItems>);
  }, [cartItems]);

  const sortedStoreNames = useMemo(() => {
    return Object.keys(groupedByStore).sort();
  }, [groupedByStore]);

  return { groupedByStore, sortedStoreNames };
};
