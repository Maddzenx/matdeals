
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
    <div className="bg-white mx-4 my-4 rounded-xl p-4 shadow-sm border border-gray-100">
      <h3 className="font-semibold text-gray-700 mb-4 text-base">Prisjämförelse</h3>
      
      <div className="space-y-3">
        {stores.map((store) => (
          <div key={store.name} className="flex justify-between items-center py-2 px-1 border-b border-gray-200 last:border-0">
            <span className="font-medium text-gray-700 text-sm">{store.name}</span>
            <span className="font-semibold text-gray-800 text-sm">{store.price}</span>
          </div>
        ))}
      </div>
      
      {stores.length > 1 && (
        <div className="flex justify-between mt-4 pt-3 border-t border-gray-300">
          <span className="font-bold text-gray-800 text-sm">Du sparar mest på</span>
          <span className="font-bold text-[#DB2C17] text-sm">{bestStore.name} ({bestStore.savings})</span>
        </div>
      )}
    </div>
  );
};
