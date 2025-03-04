
import React from "react";
import { CartItem } from "@/hooks/useNavigationState";

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
  return (
    <div className={`flex items-center py-4 border-b border-gray-200 ${item.checked ? 'opacity-80 filter blur-[0.3px]' : ''}`}>
      <button
        onClick={() => onItemCheck(item.id)}
        className={`w-6 h-6 rounded-full border-2 mr-4 flex-shrink-0 transition-colors duration-200 ${
          item.checked 
            ? 'border-green-500 bg-green-500/10 hover:bg-green-500/20' 
            : 'border-gray-300 hover:border-gray-400'
        }`}
        aria-label={item.checked ? "Mark as incomplete" : "Mark as complete"}
      >
        {item.checked && (
          <span className="flex items-center justify-center w-full h-full">
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              width="14" 
              height="14" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2.5" 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              className="text-green-500"
            >
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
          </span>
        )}
      </button>
      
      <div className="flex-grow min-w-0">
        <p className={`font-bold text-[#1C1C1C] truncate ${item.checked ? 'line-through' : ''}`}>{item.name}</p>
        <p className="text-sm text-gray-500">{item.details}</p>
      </div>
      
      <div className="flex items-center gap-4 ml-2">
        <div className="flex items-center">
          <button
            onClick={() => onDecrement(item.id)}
            className="flex items-center justify-center w-8 h-8 bg-gray-200 rounded-full hover:bg-gray-300 transition-colors"
            aria-label="Decrease quantity"
            disabled={item.quantity <= 0}
          >
            <span className="text-lg font-bold">-</span>
          </button>
          <span className="mx-3 font-medium w-5 text-center">{item.quantity}</span>
          <button
            onClick={() => onIncrement(item.id)}
            className="flex items-center justify-center w-8 h-8 bg-gray-200 rounded-full hover:bg-gray-300 transition-colors"
            aria-label="Increase quantity"
          >
            <span className="text-lg font-bold">+</span>
          </button>
        </div>
        <span className="font-medium text-[#1C1C1C] min-w-[50px] text-right">{item.price}</span>
      </div>
    </div>
  );
};
