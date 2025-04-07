
import React from "react";
import { CompactQuantityControls } from "./CompactQuantityControls";

interface ListProductCardProps {
  id: string;
  name: string;
  details: string;
  currentPrice: string;
  originalPrice: string;
  store: string;
  offerBadge?: string;
  image?: string;
  quantity: number;
  onAdd: () => void;
  onIncrement: () => void;
  onDecrement: () => void;
  onClick: () => void;
}

export const ListProductCard: React.FC<ListProductCardProps> = ({
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
    // Prevent click event from firing when interacting with quantity controls
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
      className="shadow-sm relative bg-white p-3 rounded-lg flex justify-between items-center border border-neutral-100 cursor-pointer transition-all hover:shadow-md"
      onClick={handleCardClick}
    >
      <div className="flex-grow min-w-0">
        <div className="flex justify-between items-start">
          <h3 className="text-sm font-bold text-[#1C1C1C] line-clamp-1">{name}</h3>
        </div>
        <p className="text-xs font-medium text-[#6A6A6A] line-clamp-1 mb-1">{details}</p>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            <span className="text-sm font-extrabold text-[#1C1C1C]">
              {currentPrice}
            </span>
            {originalPrice && (
              <span className="text-xs font-medium text-[#6A6A6A] line-through">
                {originalPrice}
              </span>
            )}
          </div>
          <span className="text-xs font-semibold text-[#1C1C1C] bg-neutral-100 px-1.5 py-0.5 rounded-sm ml-1 truncate max-w-[80px]">
            {store}
          </span>
        </div>
      </div>

      <div className="flex-shrink-0 ml-1 min-w-[80px]">
        <CompactQuantityControls
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
