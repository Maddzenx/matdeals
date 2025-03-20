
import React from "react";
import { toast } from "@/components/ui/use-toast";
import { StorePrice } from "@/hooks/useStorePriceCalculation";

interface ShoppingListSharingProps {
  cartItems: any[];
  storePrices: StorePrice[];
}

export const useShoppingListSharing = ({ cartItems, storePrices }: ShoppingListSharingProps) => {
  const handleShareList = async () => {
    const listText = cartItems.map(item => 
      `${item.name} - ${item.quantity} st (${item.price})`
    ).join('\n');
    
    const totalPrice = storePrices.length > 0 ? storePrices.reduce((acc, store) => acc + store.rawPrice, 0) : 0;
    const wholePart = Math.floor(totalPrice);
    const decimalPart = Math.round((totalPrice % 1) * 100).toString().padStart(2, '0');
    const formattedTotal = `${wholePart}:${decimalPart} kr`;
    
    const shareData = {
      title: 'Min inköpslista',
      text: `Kolla in min inköpslista!\n\n${listText}\n\nTotalt: ${formattedTotal}`,
      url: window.location.href
    };

    if (navigator.share && navigator.canShare(shareData)) {
      try {
        await navigator.share(shareData);
        toast({
          title: "Inköpslistan delad!",
          description: "Din inköpslista har delats framgångsrikt",
        });
      } catch (err) {
        console.error("Error sharing:", err);
        shareViaEmail(shareData);
      }
    } else {
      shareViaEmail(shareData);
    }
  };

  const shareViaEmail = (shareData: { title: string, text: string }) => {
    const mailtoLink = `mailto:?subject=${encodeURIComponent(shareData.title)}&body=${encodeURIComponent(shareData.text)}`;
    window.open(mailtoLink);
    toast({
      title: "Inköpslistan öppnad i email!",
      description: "Din inköpslista har förberetts för email",
    });
  };

  return { handleShareList };
};
