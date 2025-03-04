
import { useMemo } from "react";
import { CartItem } from "@/hooks/useNavigationState";

export interface StorePrice {
  name: string;
  price: string;
}

export interface BestStore {
  name: string;
  savings: string;
}

export const useStorePriceCalculation = (cartItems: CartItem[]) => {
  const storePrices = useMemo(() => {
    const priceMap: Record<string, number> = {};
    
    cartItems.forEach(item => {
      const store = item.store || "Övriga produkter";
      const priceValue = parseFloat(item.price.replace(/[^0-9,.]/g, '').replace(',', '.'));
      
      if (!isNaN(priceValue)) {
        if (!priceMap[store]) {
          priceMap[store] = 0;
        }
        priceMap[store] += priceValue * item.quantity;
      }
    });
    
    return Object.entries(priceMap).map(([name, total]) => ({
      name,
      price: `${total.toFixed(0)} kr`
    }));
  }, [cartItems]);

  const bestStore = useMemo(() => {
    if (storePrices.length <= 1) {
      return { name: storePrices[0]?.name || "N/A", savings: "0 kr" };
    }
    
    const sortedStores = [...storePrices].sort((a, b) => {
      const aPrice = parseFloat(a.price.replace(/[^0-9,.]/g, '').replace(',', '.'));
      const bPrice = parseFloat(b.price.replace(/[^0-9,.]/g, '').replace(',', '.'));
      return aPrice - bPrice;
    });
    
    const cheapestPrice = parseFloat(sortedStores[0].price.replace(/[^0-9,.]/g, '').replace(',', '.'));
    const secondPrice = parseFloat(sortedStores[1].price.replace(/[^0-9,.]/g, '').replace(',', '.'));
    const savings = secondPrice - cheapestPrice;
    
    return {
      name: sortedStores[0].name,
      savings: `${savings.toFixed(0)} kr`
    };
  }, [storePrices]);

  return { storePrices, bestStore };
};
