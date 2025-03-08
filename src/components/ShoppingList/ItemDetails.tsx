
import React from "react";
import { ProductImage } from "../product/ProductImage";

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
    <div className="flex items-start">
      {image && (
        <div className="w-10 h-10 rounded-md mr-2 bg-gray-50 flex-shrink-0 overflow-hidden">
          <ProductImage 
            src={image} 
            alt={name} 
            height={40}
            className="w-full h-full"
          />
        </div>
      )}
      
      <div className="flex-grow min-w-0">
        <p className={`font-bold text-sm truncate ${isChecked ? 'line-through text-gray-500' : 'text-[#1C1C1C]'}`}>
          {name}
        </p>
        <p className={`text-xs truncate ${isChecked ? 'text-gray-400' : 'text-gray-500'}`}>
          {details}
        </p>
      </div>
    </div>
  );
};
