
import React from "react";

interface ItemDetailsProps {
  name: string;
  details: string;
  image?: string;
  isChecked: boolean;
}

export const ItemDetails: React.FC<ItemDetailsProps> = ({
  name,
  details,
  isChecked,
}) => {
  return (
    <div className="flex-grow min-w-0">
      <p className={`font-bold text-sm truncate ${isChecked ? 'line-through text-gray-500' : 'text-[#1C1C1C]'}`}>
        {name}
      </p>
      <p className={`text-xs truncate ${isChecked ? 'text-gray-400' : 'text-gray-500'}`}>
        {details}
      </p>
    </div>
  );
};
