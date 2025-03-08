
import React, { useState, useEffect } from "react";
import { useNavigationState } from "@/hooks/useNavigationState";
import { Plus, Minus } from "lucide-react";

interface ProductCardProps {
  id: string;
  image: string;
  name: string;
  details: string;
  currentPrice: string;
  originalPrice: string;
  store: string;
  offerBadge?: string;
  onQuantityChange?: (productId: string, newQuantity: number, previousQuantity: number) => void;
  viewMode?: "grid" | "list";
}

export const ProductCard: React.FC<ProductCardProps> = ({
  id,
  image,
  name,
  details,
  currentPrice,
  originalPrice,
  store,
  offerBadge,
  onQuantityChange,
  viewMode = "grid",
}) => {
  const { cartItems } = useNavigationState();
  const [quantity, setQuantity] = useState(0);
  const [imageLoaded, setImageLoaded] = useState(false);
  
  // Sync with global cart state
  useEffect(() => {
    const item = cartItems.find(item => item.id === id);
    if (item) {
      setQuantity(item.quantity);
    } else {
      setQuantity(0);
    }
  }, [cartItems, id]);

  const handleAdd = () => {
    const newQuantity = 1;
    setQuantity(newQuantity);
    if (onQuantityChange) {
      onQuantityChange(id, newQuantity, 0);
    }
  };

  const handleIncrement = () => {
    const prevQuantity = quantity;
    const newQuantity = prevQuantity + 1;
    setQuantity(newQuantity);
    if (onQuantityChange) {
      onQuantityChange(id, newQuantity, prevQuantity);
    }
  };

  const handleDecrement = () => {
    const prevQuantity = quantity;
    const newQuantity = Math.max(0, prevQuantity - 1);
    setQuantity(newQuantity);
    if (onQuantityChange) {
      onQuantityChange(id, newQuantity, prevQuantity);
    }
  };

  const handleImageLoad = () => {
    setImageLoaded(true);
  };

  // For grid view (optimized for mobile)
  if (viewMode === "grid") {
    return (
      <div className="shadow-sm relative bg-white p-3 rounded-lg max-sm:p-2.5 border border-neutral-100">
        <div className="w-full h-[100px] mb-2 flex items-center justify-center rounded-[5px] overflow-hidden bg-neutral-50">
          <img
            src={image}
            alt={name}
            className={`max-w-full max-h-[100px] object-contain transition-opacity duration-200 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
            loading="lazy"
            onLoad={handleImageLoad}
          />
          {!imageLoaded && (
            <div className="absolute inset-0 bg-gray-100 animate-pulse rounded-[5px]"></div>
          )}
        </div>
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

          {quantity === 0 ? (
            <button
              onClick={handleAdd}
              className="text-white text-center text-sm font-bold bg-[#DB2C17] mt-1 px-3 py-1.5 rounded-[100px] w-full transition-colors active:bg-[#c12715] touch-manipulation"
            >
              Add to list
            </button>
          ) : (
            <div className="flex items-center h-8 flex-1 text-center text-sm font-bold bg-neutral-100 mt-1 px-1 py-0 rounded-[100px]">
              <button
                onClick={handleDecrement}
                className="flex-1 flex justify-center items-center text-center text-sm font-bold bg-white px-1 py-1 rounded-[100px] active:bg-neutral-200 transition-colors touch-manipulation"
              >
                <Minus size={16} />
              </button>
              <span className="flex-1 text-center text-sm font-bold">
                {quantity}
              </span>
              <button
                onClick={handleIncrement}
                className="flex-1 flex justify-center items-center text-center text-sm font-bold text-white bg-[#DB2C17] px-1 py-1 rounded-[100px] active:bg-[#c12715] transition-colors touch-manipulation"
              >
                <Plus size={16} />
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
  }

  // For list view (optimized for mobile)
  return (
    <div className="shadow-sm relative bg-white p-3 rounded-lg flex justify-between items-center border border-neutral-100">
      <div className="flex items-center gap-3 flex-grow pr-2">
        <div className="w-[60px] h-[60px] flex-shrink-0 flex items-center justify-center rounded-[5px] overflow-hidden bg-neutral-50 relative">
          <img
            src={image}
            alt={name}
            className={`max-w-full max-h-[60px] object-contain transition-opacity duration-200 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
            loading="lazy"
            onLoad={handleImageLoad}
          />
          {!imageLoaded && (
            <div className="absolute inset-0 bg-gray-100 animate-pulse rounded-[5px]"></div>
          )}
        </div>
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
      </div>

      <div className="flex-shrink-0 ml-1 min-w-[80px]">
        {quantity === 0 ? (
          <button
            onClick={handleAdd}
            className="text-white text-center text-sm font-bold bg-[#DB2C17] px-3 py-1.5 rounded-[100px] w-full transition-colors active:bg-[#c12715] touch-manipulation"
          >
            Add
          </button>
        ) : (
          <div className="flex items-center h-8 text-center text-sm font-bold bg-neutral-100 px-1 py-0 rounded-[100px]">
            <button
              onClick={handleDecrement}
              className="flex-1 flex justify-center items-center text-center text-sm font-bold bg-white px-1 py-1 rounded-[100px] active:bg-neutral-200 transition-colors touch-manipulation"
            >
              <Minus size={16} />
            </button>
            <span className="flex-1 text-center text-sm font-bold">
              {quantity}
            </span>
            <button
              onClick={handleIncrement}
              className="flex-1 flex justify-center items-center text-center text-sm font-bold text-white bg-[#DB2C17] px-1 py-1 rounded-[100px] active:bg-[#c12715] transition-colors touch-manipulation"
            >
              <Plus size={16} />
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
