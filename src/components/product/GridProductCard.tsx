
import React from "react";
import { QuantityControls } from "./QuantityControls";

interface GridProductCardProps {
  id: string;
  name: string;
  details: string;
  currentPrice: string;
  originalPrice: string;
  store: string;
  offerBadge?: string;
  quantity: number;
  image?: string;
  onAdd: () => void;
  onIncrement: () => void;
  onDecrement: () => void;
  onClick: () => void;
}

export const GridProductCard: React.FC<GridProductCardProps> = ({
  name,
  details,
  currentPrice,
  originalPrice,
  store,
  offerBadge,
  quantity,
  onAdd,
  onIncrement,
  onDecrement,
  onClick,
  image,
}) => {
  const handleCardClick = (e: React.MouseEvent) => {
    if (
      e.target instanceof Element && 
      (e.target.closest('button') || e.target.tagName === 'BUTTON')
    ) {
      return;
    }
    onClick();
  };

  return (
    <div 
      className="shadow-sm relative bg-white p-3 rounded-lg max-sm:p-2.5 border border-neutral-100 cursor-pointer transition-all hover:shadow-md"
      onClick={handleCardClick}
    >
      <div className="flex flex-col gap-1">
        <h3 className="text-sm font-bold text-[#1C1C1C] line-clamp-1">{name}</h3>
        <p className="text-xs font-medium text-[#6A6A6A] line-clamp-2 min-h-[2rem]">{details}</p>
        <div className="flex items-center gap-1 mt-1">
          <span className="text-base font-extrabold text-[#1C1C1C]">
            {currentPrice}
          </span>
          {originalPrice && (
            <span className="text-xs font-medium text-[#6A6A6A] line-through">
              {originalPrice}
            </span>
          )}
        </div>
        <div className="text-xs font-semibold text-[#1C1C1C] text-center bg-neutral-100 mx-0 my-1 px-1 py-0.5 rounded-sm w-full truncate">
          {store}
        </div>

        <QuantityControls
          quantity={quantity}
          onAdd={onAdd}
          onIncrement={onIncrement}
          onDecrement={onDecrement}
        />
      </div>
      {offerBadge && (
        <div className="absolute text-[#4CAF50] text-xs font-bold bg-[#E8F5E9] px-2 py-1 rounded-[27px] right-1 top-1">
          {offerBadge}
        </div>
      )}
    </div>
  );
};
