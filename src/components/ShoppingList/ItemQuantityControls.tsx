
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
        className={`flex items-center justify-center w-7 h-7 rounded-full transition-colors touch-manipulation ${
          isChecked ? 'bg-gray-100 text-gray-400' : 'bg-gray-200 active:bg-gray-300'
        }`}
        aria-label="Decrease quantity"
        disabled={quantity <= 0}
      >
        <Minus size={14} />
      </button>
      <span className={`mx-2 font-medium w-5 text-center ${isChecked ? 'text-gray-500' : ''}`}>
        {quantity}
      </span>
      <button
        onClick={onIncrement}
        className={`flex items-center justify-center w-7 h-7 rounded-full transition-colors touch-manipulation ${
          isChecked ? 'bg-gray-100 text-gray-400' : 'bg-gray-200 active:bg-gray-300'
        }`}
        aria-label="Increase quantity"
      >
        <Plus size={14} />
      </button>
    </div>
  );
};
