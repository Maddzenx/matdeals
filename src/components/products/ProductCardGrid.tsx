
import React, { useState } from 'react';
import { ProductDetailsDialog } from '@/components/product/ProductDetailsDialog';
import { Store, Tag } from 'lucide-react';

interface ProductCardGridProps {
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
    image?: string;
  };
  onQuantityChange: (newQuantity: number, previousQuantity: number) => void;
}

export function ProductCardGrid({ product, onQuantityChange }: ProductCardGridProps) {
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
        className="flex flex-col bg-white border border-neutral-100 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow"
        onClick={handleCardClick}
      >
        <div className="p-3 flex-grow relative">
          {product.is_kortvara && (
            <div className="absolute top-3 right-3">
              <div className="bg-[#FEF7CD] text-[#8D6E15] text-xs font-medium py-1 px-2 rounded-full flex items-center">
                <Tag size={12} className="mr-1" />
                Medlemspris
              </div>
            </div>
          )}
          
          <h3 className="text-sm font-semibold leading-tight line-clamp-2 text-neutral-900 mb-1">
            {product.name}
          </h3>
          
          <p className="text-xs text-neutral-600 line-clamp-2 mb-2">
            {product.details}
          </p>
          
          <div className="mt-auto flex justify-between items-center">
            <div>
              <div className="text-base font-bold text-neutral-900">
                {product.currentPrice}
              </div>
              {product.originalPrice && (
                <div className="text-xs text-neutral-500 line-through">
                  {product.originalPrice}
                </div>
              )}
            </div>
            
            <div className="flex items-center">
              <Store size={14} className="text-neutral-700 mr-1" />
              <span className="text-xs font-medium text-neutral-700 bg-neutral-100 px-1.5 py-0.5 rounded">
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
