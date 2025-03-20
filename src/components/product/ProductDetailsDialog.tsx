
import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ProductImage } from "./ProductImage";
import { QuantityControls } from "./QuantityControls";
import { ShoppingCart, Store } from "lucide-react";

interface ProductDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product: {
    id: string;
    image: string;
    name: string;
    details: string;
    currentPrice: string;
    originalPrice: string;
    store: string;
    offerBadge?: string;
  };
  quantity: number;
  onAdd: () => void;
  onIncrement: () => void;
  onDecrement: () => void;
}

export const ProductDetailsDialog: React.FC<ProductDetailsDialogProps> = ({
  open,
  onOpenChange,
  product,
  quantity,
  onAdd,
  onIncrement,
  onDecrement,
}) => {
  const { id, image, name, details, currentPrice, originalPrice, store, offerBadge } = product;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md mx-auto p-0 overflow-hidden">
        <div className="relative">
          <ProductImage 
            src={image} 
            alt={name} 
            height={200}
            className="w-full h-[200px] object-contain bg-white"
          />
          {offerBadge && (
            <div className="absolute text-[#DB2C17] text-xs font-bold bg-[#FFCD2A] px-2 py-1 rounded-[27px] right-2 top-2">
              {offerBadge}
            </div>
          )}
        </div>
        
        <div className="p-4">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-[#1C1C1C]">{name}</DialogTitle>
            <DialogDescription className="text-sm text-[#6A6A6A] mt-1">
              {details}
            </DialogDescription>
          </DialogHeader>

          <div className="mt-4 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xl font-extrabold text-[#1C1C1C]">
                  {currentPrice}
                </span>
                {originalPrice && (
                  <span className="text-sm font-medium text-[#6A6A6A] line-through">
                    {originalPrice}
                  </span>
                )}
              </div>
              
              <div className="flex items-center gap-1">
                <Store size={16} className="text-[#1C1C1C]" />
                <span className="text-sm font-semibold text-[#1C1C1C] bg-neutral-100 px-2 py-1 rounded-sm">
                  {store}
                </span>
              </div>
            </div>

            <div className="pt-2">
              <div className="bg-neutral-50 p-3 rounded-md">
                <div className="flex items-center gap-2">
                  <ShoppingCart size={18} className="text-[#1C1C1C]" />
                  <span className="text-sm font-medium">Lägg till i inköpslistan</span>
                </div>
                <div className="mt-2 max-w-[200px] mx-auto">
                  <QuantityControls
                    quantity={quantity}
                    onAdd={onAdd}
                    onIncrement={onIncrement}
                    onDecrement={onDecrement}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
