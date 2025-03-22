
import React from "react";
import { Plus, Minus } from "lucide-react";

interface QuantityControlsProps {
  quantity: number;
  onAdd: () => void;
  onIncrement: () => void;
  onDecrement: () => void;
  onSetQuantity?: (quantity: number) => void;
}

export const QuantityControls: React.FC<QuantityControlsProps> = ({
  quantity,
  onAdd,
  onIncrement,
  onDecrement,
  onSetQuantity,
}) => {
  if (quantity === 0) {
    return (
      <button
        onClick={onAdd}
        className="text-white text-center text-base font-bold bg-[#DB2C17] mt-1 px-4 py-2.5 rounded-[100px] w-full transition-colors active:bg-[#c12715] touch-manipulation"
      >
        Add to list
      </button>
    );
  }

  return (
    <div className="flex items-center h-11 flex-1 text-center text-base font-bold bg-neutral-100 mt-1 px-1.5 py-0 rounded-[100px]">
      <button
        onClick={onDecrement}
        className="flex-1 flex justify-center items-center text-center text-base font-bold bg-white px-1.5 py-1.5 rounded-[100px] active:bg-neutral-200 transition-colors touch-manipulation"
      >
        <Minus size={20} />
      </button>
      <span className="flex-1 text-center text-base font-bold">{quantity}</span>
      <button
        onClick={onIncrement}
        className="flex-1 flex justify-center items-center text-center text-base font-bold text-white bg-[#DB2C17] px-1.5 py-1.5 rounded-[100px] active:bg-[#c12715] transition-colors touch-manipulation"
      >
        <Plus size={20} />
      </button>
    </div>
  );
};
