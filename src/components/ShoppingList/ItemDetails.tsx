
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
  image,
  isChecked,
}) => {
  return (
    <div className="flex-grow min-w-0">
      <p className={`font-bold text-lg leading-tight truncate ${isChecked ? 'line-through text-gray-500' : 'text-[#1C1C1C]'}`}>
        {name}
      </p>
      <p className={`text-sm leading-snug truncate mt-0.5 ${isChecked ? 'text-gray-400' : 'text-gray-500'}`}>
        {details}
      </p>
      {image && (
        <div className="mt-1 hidden md:block">
          <img 
            src={image} 
            alt={name} 
            className="w-10 h-10 object-contain opacity-75"
            onError={(e) => (e.currentTarget.style.display = 'none')}
          />
        </div>
      )}
    </div>
  );
};
