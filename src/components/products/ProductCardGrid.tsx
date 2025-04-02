
import React, { useState } from 'react';

interface ProductCardGridProps {
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

export function ProductCardGrid({ product, onQuantityChange }: ProductCardGridProps) {
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
    <div className="bg-white border border-gray-100 rounded-lg overflow-hidden shadow-sm">
      <div className="relative h-36 bg-gray-50">
        <img 
          src={product.image} 
          alt={product.name}
          className="w-full h-full object-contain"
          onError={(e) => {
            e.currentTarget.src = 'https://assets.icanet.se/t_product_large_v1,f_auto/7310865085313.jpg';
          }}
        />
        {product.offerBadge && (
          <div className="absolute top-2 right-2 bg-yellow-400 text-[#DB2C17] font-bold text-xs px-2 py-1 rounded-full">
            {product.offerBadge}
          </div>
        )}
      </div>
      <div className="p-3">
        <h3 className="font-bold text-[#1C1C1C] text-sm mb-0.5 line-clamp-1">{product.name}</h3>
        <p className="text-xs text-gray-600 mb-1.5 line-clamp-1">{product.details}</p>
        {product.unitPrice && (
          <p className="text-xs text-gray-500 mb-1">{product.unitPrice}</p>
        )}
        <div className="flex items-baseline gap-2 mb-1">
          <span className="text-lg font-extrabold text-[#1C1C1C]">
            {product.currentPrice}
          </span>
          {product.originalPrice && (
            <span className="text-xs text-gray-500 line-through">
              {product.originalPrice}
            </span>
          )}
        </div>
        <div className="text-xs font-medium text-gray-700 mb-2.5 py-0.5 px-1 bg-gray-100 rounded text-center">
          {product.store}
        </div>
        
        {quantity === 0 ? (
          <button
            onClick={handleAddToList}
            className="w-full bg-[#DB2C17] text-white rounded-md py-2.5 text-sm font-medium"
          >
            Lägg till
          </button>
        ) : (
          <div className="flex items-center justify-between bg-gray-100 rounded-md">
            <button
              onClick={handleDecrement}
              className="h-10 w-10 flex items-center justify-center text-[#DB2C17] font-bold text-xl"
            >
              -
            </button>
            <span className="text-sm font-medium">{quantity} st</span>
            <button
              onClick={handleIncrement}
              className="h-10 w-10 flex items-center justify-center text-white bg-[#DB2C17] rounded-r-md font-bold text-xl"
            >
              +
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
