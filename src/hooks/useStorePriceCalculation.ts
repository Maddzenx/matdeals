
import { useMemo } from "react";
import { CartItem } from "@/hooks/useNavigationState";

export interface StorePrice {
  name: string;
  price: string;
  rawPrice: number;
}

export interface BestStore {
  name: string;
  savings: string;
}

export const useStorePriceCalculation = (cartItems: CartItem[]) => {
  const storePrices = useMemo(() => {
    const priceMap: Record<string, number> = {};
    
    cartItems.forEach(item => {
      const store = item.store && item.store.trim() !== "" ? item.store : "Övriga produkter";
      // Extract numeric price from string like "10:00 kr" or "9:90 kr/st"
      const priceString = item.price.replace(/[^0-9,.]/g, '').replace(',', '.').replace(':', '.');
      const priceValue = parseFloat(priceString);
      
      if (!isNaN(priceValue)) {
        if (!priceMap[store]) {
          priceMap[store] = 0;
        }
        // Multiply by quantity to get total price for this item
        priceMap[store] += priceValue * item.quantity;
      }
    });
    
    return Object.entries(priceMap).map(([name, total]) => {
      // Format price to Swedish format: XX:YY kr
      // Divide by 100 if the value is large (indicating it's in öre instead of kronor)
      // This handles cases where prices might be stored as "1990" (meaning 19.90)
      const adjustedTotal = total > 100 ? total / 100 : total;
      
      // Format as XX:YY kr
      const wholePart = Math.floor(adjustedTotal);
      const decimalPart = Math.round((adjustedTotal % 1) * 100).toString().padStart(2, '0');
      
      const formattedPrice = `${wholePart}:${decimalPart} kr`;
      
      return {
        name,
        price: formattedPrice,
        rawPrice: adjustedTotal
      };
    });
  }, [cartItems]);

  const bestStore = useMemo(() => {
    if (storePrices.length <= 1) {
      return { name: storePrices[0]?.name || "N/A", savings: "0:00 kr" };
    }
    
    // Find the store with the highest discount compared to others
    let highestSavingsStore = storePrices[0];
    let highestSavings = 0;
    
    // Find the most expensive store to compare against
    const mostExpensiveStore = storePrices.reduce((max, store) => 
      store.rawPrice > max.rawPrice ? store : max
    , storePrices[0]);
    
    // Calculate savings for each store compared to the most expensive one
    for (const store of storePrices) {
      const storeSavings = mostExpensiveStore.rawPrice - store.rawPrice;
      if (storeSavings > highestSavings && store.name !== mostExpensiveStore.name) {
        highestSavings = storeSavings;
        highestSavingsStore = store;
      }
    }
    
    // Format savings to Swedish format: XX:YY kr
    const wholePart = Math.floor(highestSavings);
    const decimalPart = Math.round((highestSavings % 1) * 100).toString().padStart(2, '0');
    
    return {
      name: highestSavingsStore.name,
      savings: `${wholePart}:${decimalPart} kr`
    };
  }, [storePrices]);

  return { storePrices, bestStore };
};
