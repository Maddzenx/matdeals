
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
    <div className="bg-gray-100 mx-4 my-8 rounded-xl p-5 shadow-sm">
      <h3 className="font-semibold text-gray-700 mb-4">Prisjämförelse</h3>
      
      <div className="space-y-4">
        {stores.map((store) => (
          <div key={store.name} className="flex justify-between items-center py-2 px-1">
            <span className="font-medium text-gray-700">{store.name}</span>
            <span className="font-semibold text-gray-800">{store.price}</span>
          </div>
        ))}
      </div>
      
      {stores.length > 1 && (
        <div className="flex justify-between mt-5 pt-4 border-t border-gray-300">
          <span className="font-bold text-gray-800">Du sparar mest på</span>
          <span className="font-bold text-[#DB2C17]">{bestStore.name} ({bestStore.savings})</span>
        </div>
      )}
    </div>
  );
};
