
import React from "react";
import { CartItem } from "@/hooks/useCartState";
import { ShoppingListItem } from "./ShoppingListItem";

interface CategoryProductGroupProps {
  categoryName: string;
  items: CartItem[];
  onItemCheck: (id: string) => void;
  onIncrement: (id: string) => void;
  onDecrement: (id: string) => void;
  onSetQuantity?: (id: string, quantity: number) => void;
}

export const CategoryProductGroup: React.FC<CategoryProductGroupProps> = ({
  categoryName,
  items,
  onItemCheck,
  onIncrement,
  onDecrement,
  onSetQuantity,
}) => {
  // Format category names consistently
  const formatCategoryName = (name: string) => {
    if (name === "uncategorized") return "Övrigt";
    return name.charAt(0).toUpperCase() + name.slice(1);
  };

  return (
    <div className="py-2">
      <div className="py-2 sticky top-[120px] bg-white z-10">
        <h2 className="text-lg font-bold">{formatCategoryName(categoryName)}</h2>
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
