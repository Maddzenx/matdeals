
import React from "react";
import { CartItem } from "@/hooks/useNavigationState";
import { Plus, Minus, Check } from "lucide-react";

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
    <div className="flex items-center py-3 border-b border-gray-200">
      <button
        onClick={() => onItemCheck(item.id)}
        className={`w-6 h-6 rounded-full border-2 mr-3 flex-shrink-0 transition-colors duration-200 ${
          item.checked 
            ? 'border-green-500 bg-green-500/10 active:bg-green-500/20' 
            : 'border-gray-300 active:border-gray-400'
        }`}
        aria-label={item.checked ? "Mark as incomplete" : "Mark as complete"}
      >
        {item.checked && (
          <span className="flex items-center justify-center w-full h-full">
            <Check size={14} className="text-green-500" strokeWidth={2.5} />
          </span>
        )}
      </button>
      
      <div className="flex-grow min-w-0 mr-2">
        <div className="flex items-start">
          {item.image && (
            <div className="w-10 h-10 rounded-md mr-2 bg-gray-50 flex-shrink-0 overflow-hidden">
              <img 
                src={item.image} 
                alt={item.name} 
                className="w-full h-full object-contain"
                loading="lazy"
              />
            </div>
          )}
          
          <div className="flex-grow min-w-0">
            <p className={`font-bold text-sm truncate ${item.checked ? 'line-through text-gray-500' : 'text-[#1C1C1C]'}`}>{item.name}</p>
            <p className={`text-xs truncate ${item.checked ? 'text-gray-400' : 'text-gray-500'}`}>{item.details}</p>
          </div>
        </div>
      </div>
      
      <div className="flex items-center gap-2 ml-auto">
        <div className="flex items-center">
          <button
            onClick={() => onDecrement(item.id)}
            className={`flex items-center justify-center w-7 h-7 rounded-full transition-colors touch-manipulation ${
              item.checked ? 'bg-gray-100 text-gray-400' : 'bg-gray-200 active:bg-gray-300'
            }`}
            aria-label="Decrease quantity"
            disabled={item.quantity <= 0}
          >
            <Minus size={14} />
          </button>
          <span className={`mx-2 font-medium w-5 text-center ${item.checked ? 'text-gray-500' : ''}`}>
            {item.quantity}
          </span>
          <button
            onClick={() => onIncrement(item.id)}
            className={`flex items-center justify-center w-7 h-7 rounded-full transition-colors touch-manipulation ${
              item.checked ? 'bg-gray-100 text-gray-400' : 'bg-gray-200 active:bg-gray-300'
            }`}
            aria-label="Increase quantity"
          >
            <Plus size={14} />
          </button>
        </div>
        <span className={`font-medium text-sm min-w-[50px] text-right ${item.checked ? 'text-gray-500' : 'text-[#1C1C1C]'}`}>{item.price}</span>
      </div>
    </div>
  );
};
