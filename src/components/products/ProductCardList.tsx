
import React, { useState } from 'react';
import { ProductDetailsDialog } from '@/components/product/ProductDetailsDialog';
import { Store, Tag } from 'lucide-react';

interface ProductCardListProps {
  product: {
    id: string;
    name: string;
    details: string;
    currentPrice: string;
    originalPrice: string;
    store: string;
    offerBadge?: string;
    is_kortvara?: boolean;
    unitPrice?: string;
    offer_details?: string;
  };
  onQuantityChange: (newQuantity: number, previousQuantity: number) => void;
}

export function ProductCardList({ product, onQuantityChange }: ProductCardListProps) {
  const [quantity, setQuantity] = useState(0);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  const handleAdd = () => {
    const newQuantity = 1;
    setQuantity(newQuantity);
    onQuantityChange(newQuantity, 0);
  };

  const handleIncrement = () => {
    const newQuantity = quantity + 1;
    setQuantity(newQuantity);
    onQuantityChange(newQuantity, quantity);
  };

  const handleDecrement = () => {
    const newQuantity = Math.max(0, quantity - 1);
    setQuantity(newQuantity);
    onQuantityChange(newQuantity, quantity);
  };

  const handleCardClick = () => {
    setIsDialogOpen(true);
  };

  return (
    <>
      <div 
        className="flex bg-white border border-neutral-100 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow"
        onClick={handleCardClick}
      >
        <div className="p-3 flex-grow relative w-full">
          {product.is_kortvara && (
            <div className="absolute top-3 right-3">
              <div className="bg-[#FEF7CD] text-[#8D6E15] text-xs font-medium py-1 px-2 rounded-full flex items-center">
                <Tag size={12} className="mr-1" />
                Medlemspris
              </div>
            </div>
          )}
          
          <div className="flex items-start justify-between">
            <h3 className="text-base font-semibold leading-tight text-neutral-900 mb-1">
              {product.name}
            </h3>
            
            {product.offerBadge && (
              <div className="bg-red-100 text-red-600 text-xs font-medium py-1 px-2 rounded-full flex items-center ml-2">
                <Tag size={12} className="mr-1" />
                {product.offerBadge}
              </div>
            )}
          </div>
          
          <p className="text-sm text-neutral-600 mb-2">
            {product.details}
          </p>
          
          <div className="flex justify-between items-end">
            <div className="flex items-end">
              <div className="text-lg font-bold text-neutral-900 mr-2">
                {product.currentPrice}
              </div>
              {product.originalPrice && (
                <div className="text-sm text-neutral-500 line-through mb-0.5">
                  {product.originalPrice}
                </div>
              )}
            </div>
            
            <div className="flex items-center">
              <Store size={16} className="text-neutral-700 mr-1" />
              <span className="text-sm font-medium text-neutral-700 bg-neutral-100 px-2 py-1 rounded">
                {product.store}
              </span>
            </div>
          </div>
        </div>
      </div>
      
      <ProductDetailsDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        product={product}
        quantity={quantity}
        onAdd={handleAdd}
        onIncrement={handleIncrement}
        onDecrement={handleDecrement}
      />
    </>
  );
}
