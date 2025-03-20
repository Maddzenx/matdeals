
import React from "react";
import { CartItem } from "@/hooks/useCartState";
import { ShoppingListItem } from "./ShoppingListItem";
import { Tag } from "lucide-react";

interface CategoryProductGroupProps {
  categoryName: string;
  items: CartItem[];
  onItemCheck: (id: string) => void;
  onIncrement: (id: string) => void;
  onDecrement: (id: string) => void;
}

export const CategoryProductGroup: React.FC<CategoryProductGroupProps> = ({
  categoryName,
  items,
  onItemCheck,
  onIncrement,
  onDecrement
}) => {
  return (
    <div className="mt-3">
      <div className="sticky top-[116px] bg-white py-2 z-10 border-b border-gray-200">
        <h2 className="text-base font-semibold text-[#1C1C1C] flex items-center gap-2 px-4">
          <Tag size={18} className="text-gray-600" />
          {categoryName}
        </h2>
      </div>
      <div className="divide-y divide-gray-200 px-4">
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
