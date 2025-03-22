
import React from "react";
import { useIsMobile } from "@/hooks/use-mobile";

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
  const isMobile = useIsMobile();
  
  return (
    <div className="flex-grow min-w-0">
      <p className={`font-bold text-lg leading-tight truncate ${isChecked ? 'line-through text-gray-500' : 'text-[#1C1C1C]'}`}>
        {name}
      </p>
      <p className={`text-sm leading-snug truncate mt-0.5 ${isChecked ? 'text-gray-400' : 'text-gray-500'}`}>
        {details}
      </p>
      {image && (
        <div className="mt-1">
          <img 
            src={image} 
            alt={name} 
            className={`${isMobile ? 'w-12 h-12' : 'w-14 h-14'} object-contain opacity-75 rounded-md`}
            onError={(e) => (e.currentTarget.style.display = 'none')}
          />
        </div>
      )}
    </div>
  );
};
