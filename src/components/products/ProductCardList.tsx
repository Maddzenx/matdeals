
import React, { useState } from 'react';

interface ProductCardListProps {
  product: {
    id: string;
    name: string;
    details: string;
    image: string;
    currentPrice: string;
    originalPrice: string;
    store: string;
    offerBadge?: string;
    unitPrice?: string;
  };
  onQuantityChange: (newQuantity: number, previousQuantity: number) => void;
}

export function ProductCardList({ product, onQuantityChange }: ProductCardListProps) {
  const [quantity, setQuantity] = useState(0);

  const handleIncrement = () => {
    const prevQuantity = quantity;
    const newQuantity = prevQuantity + 1;
    setQuantity(newQuantity);
    onQuantityChange(newQuantity, prevQuantity);
  };

  const handleDecrement = () => {
    if (quantity > 0) {
      const prevQuantity = quantity;
      const newQuantity = prevQuantity - 1;
      setQuantity(newQuantity);
      onQuantityChange(newQuantity, prevQuantity);
    }
  };

  const handleAddToList = () => {
    if (quantity === 0) {
      const newQuantity = 1;
      setQuantity(newQuantity);
      onQuantityChange(newQuantity, 0);
    }
  };

  return (
    <div className="bg-white border border-gray-100 rounded-lg overflow-hidden shadow-sm flex">
      <div className="relative h-20 w-20 bg-gray-50 flex-shrink-0">
        <img 
          src={product.image} 
          alt={product.name}
          className="w-full h-full object-contain"
          onError={(e) => {
            e.currentTarget.src = 'https://assets.icanet.se/t_product_large_v1,f_auto/7310865085313.jpg';
          }}
        />
        {product.offerBadge && (
          <div className="absolute top-1 right-1 bg-yellow-400 text-[#DB2C17] font-bold text-[8px] px-1 py-0.5 rounded-full">
            {product.offerBadge}
          </div>
        )}
      </div>
      <div className="p-3 flex-grow flex flex-col justify-between">
        <div>
          <h3 className="font-bold text-[#1C1C1C] text-sm mb-0.5 line-clamp-1">{product.name}</h3>
          <p className="text-xs text-gray-600 mb-1 line-clamp-1">{product.details}</p>
          {product.unitPrice && (
            <p className="text-xs text-gray-500">{product.unitPrice}</p>
          )}
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-baseline gap-2">
            <span className="text-sm font-extrabold text-[#1C1C1C]">
              {product.currentPrice}
            </span>
            {product.originalPrice && (
              <span className="text-xs text-gray-500 line-through">
                {product.originalPrice}
              </span>
            )}
          </div>
          <div className="text-xs font-medium text-gray-700 px-1 py-0.5 bg-gray-100 rounded">
            {product.store}
          </div>
        </div>
        <div className="mt-2">
          {quantity === 0 ? (
            <button
              onClick={handleAddToList}
              className="w-full bg-[#DB2C17] text-white rounded-md py-1.5 text-xs font-medium"
            >
              Lägg till
            </button>
          ) : (
            <div className="flex items-center justify-between bg-gray-100 rounded-md">
              <button
                onClick={handleDecrement}
                className="h-8 w-8 flex items-center justify-center text-[#DB2C17] font-bold text-sm"
              >
                -
              </button>
              <span className="text-xs font-medium">{quantity} st</span>
              <button
                onClick={handleIncrement}
                className="h-8 w-8 flex items-center justify-center text-white bg-[#DB2C17] rounded-r-md font-bold text-sm"
              >
                +
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
