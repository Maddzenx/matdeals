
import React from "react";
import { Check } from "lucide-react";

interface CheckboxButtonProps {
  checked: boolean;
  onCheck: () => void;
}

export const CheckboxButton: React.FC<CheckboxButtonProps> = ({
  checked,
  onCheck,
}) => {
  return (
    <button
      onClick={onCheck}
      className={`w-8 h-8 rounded-full border-2 mr-3 flex-shrink-0 transition-colors duration-200 ${
        checked 
          ? 'border-green-500 bg-green-500/10 active:bg-green-500/20' 
          : 'border-gray-300 active:border-gray-400'
      }`}
      aria-label={checked ? "Mark as incomplete" : "Mark as complete"}
    >
      {checked && (
        <span className="flex items-center justify-center w-full h-full">
          <Check size={18} className="text-green-500" strokeWidth={2.5} />
        </span>
      )}
    </button>
  );
};
