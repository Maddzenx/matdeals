
import React from "react";
import { CartItem } from "@/hooks/useNavigationState";
import { ShoppingListItem } from "./ShoppingListItem";

interface StoreProductGroupProps {
  storeName: string;
  items: CartItem[];
  onItemCheck: (id: string) => void;
  onIncrement: (id: string) => void;
  onDecrement: (id: string) => void;
}

export const StoreProductGroup: React.FC<StoreProductGroupProps> = ({
  storeName,
  items,
  onItemCheck,
  onIncrement,
  onDecrement
}) => {
  return (
    <div className="mt-4">
      <div className="sticky top-[116px] bg-white py-2 z-10">
        <h2 className="text-lg font-semibold">{storeName}</h2>
      </div>
      <div className="divide-y divide-gray-200">
        {items.map((item) => (
          <ShoppingListItem
            key={item.id}
            item={item}
            onItemCheck={onItemCheck}
            onIncrement={onIncrement}
            onDecrement={onDecrement}
          />
        ))}
      </div>
    </div>
  );
};
