
import React from "react";
import { CartItem } from "@/hooks/useCartState";
import { CheckboxButton } from "./CheckboxButton";
import { ItemDetails } from "./ItemDetails";
import { TapToEditQuantity } from "./TapToEditQuantity";

interface ShoppingListItemProps {
  item: CartItem;
  onItemCheck: (id: string) => void;
  onIncrement: (id: string) => void;
  onDecrement: (id: string) => void;
}

export const ShoppingListItem: React.FC<ShoppingListItemProps> = ({
  item,
  onItemCheck,
  onIncrement,
  onDecrement,
}) => {
  // Combined function to handle quantity changes directly
  const handleQuantityChange = (newQuantity: number) => {
    if (newQuantity > item.quantity) {
      // Increment as needed
      for (let i = item.quantity; i < newQuantity; i++) {
        onIncrement(item.id);
      }
    } else if (newQuantity < item.quantity) {
      // Decrement as needed
      for (let i = item.quantity; i > newQuantity; i--) {
        onDecrement(item.id);
      }
    }
  };

  return (
    <div className="flex items-center py-3 border-b border-gray-200">
      <CheckboxButton
        checked={item.checked}
        onCheck={() => onItemCheck(item.id)}
      />
      
      <div className="flex-grow min-w-0 mr-2">
        <ItemDetails 
          name={item.name}
          details={item.details}
          image={item.image}
          isChecked={item.checked}
        />
      </div>
      
      <div className="flex items-center gap-3 ml-auto">
        <TapToEditQuantity
          quantity={item.quantity}
          isChecked={item.checked}
          onQuantityChange={handleQuantityChange}
        />
        <span className={`font-medium text-sm min-w-[50px] text-right ${item.checked ? 'text-gray-500' : 'text-[#1C1C1C]'}`}>
          {item.price}
        </span>
      </div>
    </div>
  );
};
