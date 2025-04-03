
import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { QuantityControls } from "./QuantityControls";
import { Store, Tag, Calendar, Info } from "lucide-react";

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
    offer_details?: string;
    unitPrice?: string;
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
  const { id, name, details, currentPrice, originalPrice, store, offerBadge, offer_details, unitPrice } = product;

  // Parse offer dates if available
  const extractDates = (offerDetails?: string) => {
    if (!offerDetails) return null;
    
    const dateRegex = /Giltig (\d{1,2}\/\d{1,2}) - (\d{1,2}\/\d{1,2})/i;
    const match = offerDetails.match(dateRegex);
    
    if (match && match.length >= 3) {
      return {
        start: match[1],
        end: match[2]
      };
    }
    return null;
  };

  const offerDates = extractDates(offer_details);

  // Format offer details for display
  const formatOfferDetailsForDisplay = (details?: string) => {
    if (!details) return null;
    
    // Return the details split by line breaks for rendering
    return details.split(/\r?\n|<br>/).filter(line => line.trim() !== '');
  };
  
  const formattedOfferDetails = formatOfferDetailsForDisplay(offer_details);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md mx-auto p-0 overflow-hidden">
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

            {/* Offer Badge and Details Section */}
            {(offerBadge || unitPrice || formattedOfferDetails?.length > 0) && (
              <div className="bg-neutral-50 p-3 rounded-md mt-2">
                <div className="flex flex-col gap-2">
                  {offerBadge && (
                    <div className="flex items-center gap-2">
                      <Tag size={16} className="text-[#8D6E15]" />
                      <span className="text-sm font-semibold text-[#8D6E15]">{offerBadge}</span>
                    </div>
                  )}
                  
                  {offerDates && (
                    <div className="flex items-center gap-2">
                      <Calendar size={16} className="text-gray-600" />
                      <span className="text-sm text-gray-600">
                        Giltigt {offerDates.start} - {offerDates.end}
                      </span>
                    </div>
                  )}
                  
                  {formattedOfferDetails && formattedOfferDetails.length > 0 && (
                    <div className="flex flex-col gap-1 mt-1">
                      {formattedOfferDetails.map((line, index) => (
                        <div key={index} className="flex items-start gap-2">
                          <Info size={16} className="text-gray-600 mt-0.5 flex-shrink-0" />
                          <span className="text-sm text-gray-600">{line}</span>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {unitPrice && !formattedOfferDetails?.some(detail => detail.includes(unitPrice)) && (
                    <div className="flex items-center gap-2">
                      <Info size={16} className="text-gray-600" />
                      <span className="text-sm text-gray-600">{unitPrice}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="pt-2">
              <div className="bg-neutral-50 p-3 rounded-md">
                <div className="flex items-center gap-2">
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
