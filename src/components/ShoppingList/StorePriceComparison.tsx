
import React from "react";
import { StorePrice, BestStore } from "@/hooks/useStorePriceCalculation";

interface StorePriceComparisonProps {
  stores: StorePrice[];
  bestStore: BestStore;
}

export const StorePriceComparison: React.FC<StorePriceComparisonProps> = ({
  stores,
  bestStore,
}) => {
  return (
    <div className="bg-gray-100 mx-4 rounded-xl p-5 mb-4 shadow-sm">
      <h3 className="font-semibold text-gray-700 mb-2">Prisjämförelse</h3>
      
      {stores.map((store) => (
        <div key={store.name} className="flex justify-between py-2.5">
          <span className="font-medium">{store.name}</span>
          <span className="font-semibold">{store.price}</span>
        </div>
      ))}
      
      {stores.length > 0 && (
        <div className="flex justify-between mt-3 pt-3 border-t border-gray-300">
          <span className="font-bold">Du sparar mest på</span>
          <span className="font-bold text-[#DB2C17]">{bestStore.name} ({bestStore.savings})</span>
        </div>
      )}
    </div>
  );
};
