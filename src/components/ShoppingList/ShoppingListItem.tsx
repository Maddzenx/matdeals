
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
  onSetQuantity?: (id: string, quantity: number) => void;
}

export const ShoppingListItem: React.FC<ShoppingListItemProps> = ({
  item,
  onItemCheck,
  onIncrement,
  onDecrement,
  onSetQuantity,
}) => {
  // Direct update function for quantity changes
  const handleQuantityChange = (newQuantity: number) => {
    // If we have the direct set quantity function, use it
    if (onSetQuantity) {
      onSetQuantity(item.id, newQuantity);
    } 
    // Fall back to increment/decrement if needed
    else if (newQuantity > item.quantity) {
      // Use the existing product data when updating
      const productData = {
        name: item.name,
        details: item.details,
        price: item.price,
        image: item.image,
        store: item.store,
        recipeId: item.recipeId,
        recipeTitle: item.recipeTitle
      };
      
      // We're going to trigger onIncrement once, which will correctly pass product data to the underlying
      // handleProductQuantityChange function with the new quantity
      onIncrement(item.id);
      
      // Then we'll trigger onDecrement as many times as needed to get back to the desired quantity
      // This ensures product data is maintained while achieving the right final quantity
      const timesToDecrement = item.quantity + 1 - newQuantity;
      if (timesToDecrement > 0) {
        for (let i = 0; i < timesToDecrement; i++) {
          onDecrement(item.id);
        }
      }
    } else if (newQuantity < item.quantity) {
      // Calculate how many times to decrement to reach the desired quantity
      const timesToDecrement = item.quantity - newQuantity;
      for (let i = 0; i < timesToDecrement; i++) {
        onDecrement(item.id);
      }
    }
  };

  return (
    <div 
      className="flex items-center py-3 border-b border-gray-200 cursor-pointer"
      onClick={() => onItemCheck(item.id)}
    >
      {/* Use stopPropagation to prevent the checkbox click from triggering the parent div's onClick */}
      <div onClick={(e) => e.stopPropagation()}>
        <CheckboxButton
          checked={item.checked}
          onCheck={() => onItemCheck(item.id)}
        />
      </div>
      
      <div className="flex-grow min-w-0 mr-2">
        <ItemDetails 
          name={item.name}
          details={item.details}
          image={item.image}
          isChecked={item.checked}
        />
      </div>
      
      <div className="flex items-center gap-3 ml-auto" onClick={(e) => e.stopPropagation()}>
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
