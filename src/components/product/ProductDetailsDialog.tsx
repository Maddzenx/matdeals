
import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { QuantityControls } from "./QuantityControls";
import { Tag } from "lucide-react";

interface ProductDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
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
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">{product.name}</DialogTitle>
        </DialogHeader>
        
        {product.image && (
          <div className="relative w-full h-48 bg-gray-100 rounded-md overflow-hidden">
            <img 
              src={product.image} 
              alt={product.name} 
              className="w-full h-full object-contain"
              onError={(e) => {
                (e.target as HTMLImageElement).src = 'https://assets.icanet.se/t_product_large_v1,f_auto/7310865085313.jpg';
              }}
            />
            
            {product.is_kortvara && (
              <div className="absolute top-2 right-2">
                <div className="bg-[#FEF7CD] text-[#8D6E15] text-xs font-medium py-1 px-2 rounded-full flex items-center">
                  <Tag size={12} className="mr-1" />
                  Medlemspris
                </div>
              </div>
            )}
            
            {product.offerBadge && (
              <div className="absolute top-2 left-2 bg-red-100 text-red-600 text-xs font-medium py-1 px-2 rounded-full">
                {product.offerBadge}
              </div>
            )}
          </div>
        )}
        
        <div className="space-y-4">
          <p className="text-sm text-gray-600">{product.details}</p>
          
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold">{product.currentPrice}</span>
            {product.originalPrice && (
              <span className="text-sm text-gray-500 line-through">{product.originalPrice}</span>
            )}
          </div>
          
          {product.unitPrice && (
            <div className="text-sm text-gray-500">{product.unitPrice}</div>
          )}
          
          {product.offer_details && (
            <div className="text-sm bg-red-50 text-red-600 p-2 rounded">
              {product.offer_details}
            </div>
          )}
          
          <div className="flex items-center gap-2 py-2">
            <div className="text-xs font-medium px-2 py-1 bg-gray-100 rounded">
              {product.store}
            </div>
          </div>
          
          <div className="pt-4">
            <QuantityControls
              quantity={quantity}
              onAdd={onAdd}
              onIncrement={onIncrement}
              onDecrement={onDecrement}
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
