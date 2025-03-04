
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
      // Convert to string and format properly for Swedish pricing (divide by 100)
      const wholePart = Math.floor(total);
      const decimalPart = Math.round((total % 1) * 100).toString().padStart(2, '0');
      
      // Format as XX:YY kr
      const formattedPrice = `${wholePart}:${decimalPart} kr`;
      
      return {
        name,
        price: formattedPrice,
        rawPrice: total
      };
    });
  }, [cartItems]);

  const bestStore = useMemo(() => {
    if (storePrices.length <= 1) {
      return { name: storePrices[0]?.name || "N/A", savings: "0:00 kr" };
    }
    
    // Find the store with the lowest total price
    let lowestPriceStore = storePrices[0];
    let secondLowestPriceStore = storePrices[0];
    
    for (const store of storePrices) {
      if (store.rawPrice < lowestPriceStore.rawPrice) {
        secondLowestPriceStore = lowestPriceStore;
        lowestPriceStore = store;
      } else if (store.rawPrice < secondLowestPriceStore.rawPrice && store.name !== lowestPriceStore.name) {
        secondLowestPriceStore = store;
      }
    }
    
    // Calculate savings compared to the second lowest price store
    const savings = secondLowestPriceStore.rawPrice - lowestPriceStore.rawPrice;
    
    // Format savings to Swedish format: XX:YY kr
    const wholePart = Math.floor(savings);
    const decimalPart = Math.round((savings % 1) * 100).toString().padStart(2, '0');
    
    return {
      name: lowestPriceStore.name,
      savings: `${wholePart}:${decimalPart} kr`
    };
  }, [storePrices]);

  return { storePrices, bestStore };
};
