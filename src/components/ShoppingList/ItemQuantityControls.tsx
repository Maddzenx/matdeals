
import React from "react";
import { Plus, Minus } from "lucide-react";

interface ItemQuantityControlsProps {
  quantity: number;
  isChecked: boolean;
  onIncrement: () => void;
  onDecrement: () => void;
}

export const ItemQuantityControls: React.FC<ItemQuantityControlsProps> = ({
  quantity,
  isChecked,
  onIncrement,
  onDecrement,
}) => {
  return (
    <div className="flex items-center">
      <button
        onClick={onDecrement}
        className={`flex items-center justify-center w-9 h-9 rounded-full transition-colors touch-manipulation ${
          isChecked ? 'bg-gray-100 text-gray-400' : 'bg-gray-200 active:bg-gray-300'
        }`}
        aria-label="Decrease quantity"
        disabled={quantity <= 0}
      >
        <Minus size={18} />
      </button>
      <span className={`mx-3 font-medium w-6 text-center text-lg ${isChecked ? 'text-gray-500' : ''}`}>
        {quantity}
      </span>
      <button
        onClick={onIncrement}
        className={`flex items-center justify-center w-9 h-9 rounded-full transition-colors touch-manipulation ${
          isChecked ? 'bg-gray-100 text-gray-400' : 'bg-gray-200 active:bg-gray-300'
        }`}
        aria-label="Increase quantity"
      >
        <Plus size={18} />
      </button>
    </div>
  );
};
