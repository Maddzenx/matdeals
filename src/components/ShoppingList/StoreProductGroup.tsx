
import React from "react";
import { CartItem } from "@/hooks/useCartState";
import { ShoppingListItem } from "./ShoppingListItem";

interface StoreProductGroupProps {
  storeName: string;
  items: CartItem[];
  onItemCheck: (id: string) => void;
  onIncrement: (id: string) => void;
  onDecrement: (id: string) => void;
  onSetQuantity?: (id: string, quantity: number) => void;
}

export const StoreProductGroup: React.FC<StoreProductGroupProps> = ({
  storeName,
  items,
  onItemCheck,
  onIncrement,
  onDecrement,
  onSetQuantity,
}) => {
  // Format store names consistently
  const formatStoreName = (name: string) => {
    const lowerName = name.toLowerCase();
    
    if (lowerName === "ica") return "ICA";
    if (lowerName === "willys") return "Willys";
    if (lowerName === "willys johanneberg") return "Willys Johanneberg";
    if (lowerName === "hemkop") return "Hemköp";
    
    // Default formatting
    return name.split(' ').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  return (
    <div className="py-2">
      <div className="py-2 sticky top-[120px] bg-white z-10">
        <h2 className="text-lg font-bold">{formatStoreName(storeName)}</h2>
      </div>
      <div>
        {items.map((item) => (
          <ShoppingListItem
            key={item.id}
            item={item}
            onItemCheck={onItemCheck}
            onIncrement={onIncrement}
            onDecrement={onDecrement}
            onSetQuantity={onSetQuantity}
          />
        ))}
      </div>
    </div>
  );
};
