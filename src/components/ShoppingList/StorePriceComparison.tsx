
import React from "react";

interface StorePrice {
  name: string;
  price: string;
}

interface StorePriceComparisonProps {
  stores: StorePrice[];
  bestStore: {
    name: string;
    savings: string;
  };
}

export const StorePriceComparison: React.FC<StorePriceComparisonProps> = ({
  stores,
  bestStore,
}) => {
  return (
    <div className="bg-gray-100 mx-4 rounded-xl p-5 mb-6 shadow-sm">
      {stores.map((store) => (
        <div key={store.name} className="flex justify-between py-2.5">
          <span className="font-medium">{store.name}</span>
          <span className="font-semibold">{store.price}</span>
        </div>
      ))}
      <div className="flex justify-between mt-3 pt-3 border-t border-gray-300">
        <span className="font-bold">Du sparar mest på</span>
        <span className="font-bold text-[#DB2C17]">{bestStore.name} {bestStore.savings}</span>
      </div>
    </div>
  );
};
