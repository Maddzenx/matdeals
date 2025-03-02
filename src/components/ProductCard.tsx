
import React, { useState } from "react";

interface ProductCardProps {
  image: string;
  name: string;
  details: string;
  currentPrice: string;
  originalPrice: string;
  store: string;
  offerBadge?: string;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  image,
  name,
  details,
  currentPrice,
  originalPrice,
  store,
  offerBadge,
}) => {
  const [quantity, setQuantity] = useState(0);

  const handleAdd = () => setQuantity(1);
  const handleIncrement = () => setQuantity((prev) => prev + 1);
  const handleDecrement = () => setQuantity((prev) => Math.max(0, prev - 1));

  return (
    <div className="shadow-[0_0_2px_rgba(0,0,0,0.08),0_0_20px_rgba(0,0,0,0.04)] relative bg-white p-3 rounded-lg max-sm:p-2.5">
      <div className="w-full h-[85px] mb-3 flex items-center justify-center rounded-[5px] overflow-hidden bg-neutral-50">
        <img
          src={image}
          alt={name}
          className="max-w-full max-h-[85px] object-contain"
        />
      </div>
      <div className="flex flex-col gap-1">
        <h3 className="text-sm font-bold text-[#1C1C1C] line-clamp-1">{name}</h3>
        <p className="text-xs font-medium text-[#6A6A6A] line-clamp-2 min-h-[2rem]">{details}</p>
        <div className="flex items-center gap-1 mt-2">
          <span className="text-base font-extrabold text-[#1C1C1C]">
            {currentPrice}
          </span>
          <span className="text-xs font-medium text-[#6A6A6A] line-through">
            {originalPrice}
          </span>
        </div>
        <div className="text-xs font-semibold text-[#1C1C1C] text-center bg-neutral-100 mx-0 my-1 px-1 py-0.5 rounded-sm w-full">
          {store}
        </div>

        {quantity === 0 ? (
          <button
            onClick={handleAdd}
            className="text-white text-center text-sm font-bold bg-[#DB2C17] mt-2 px-3 py-1.5 rounded-[100px] w-full"
          >
            Add to list
          </button>
        ) : (
          <div className="flex items-center h-8 flex-1 text-center text-sm font-bold bg-neutral-100 mt-2 px-1 py-0 rounded-[100px]">
            <button
              onClick={handleDecrement}
              className="flex-1 text-center text-sm font-bold bg-white px-2 py-1.5 rounded-[100px]"
            >
              -
            </button>
            <span className="flex-1 text-center text-sm font-bold">
              {quantity} st
            </span>
            <button
              onClick={handleIncrement}
              className="flex-1 text-center text-sm font-bold text-white bg-[#DB2C17] px-2 py-1.5 rounded-[100px]"
            >
              +
            </button>
          </div>
        )}
      </div>
      {offerBadge && (
        <div className="absolute text-[#DB2C17] text-xs font-bold bg-[#FFCD2A] px-2 py-1 rounded-[27px] right-1 top-1">
          {offerBadge}
        </div>
      )}
    </div>
  );
};
