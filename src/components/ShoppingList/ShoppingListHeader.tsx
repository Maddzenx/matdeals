
import React from "react";
import { ShoppingListTabs } from "./ShoppingListTabs";
import { Share2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ShoppingListHeaderProps {
  activeTab: "recent" | "stores";
  onTabChange: (tab: "recent" | "stores") => void;
  cartItems: any[]; // Add cartItems prop
}

export const ShoppingListHeader: React.FC<ShoppingListHeaderProps> = ({
  activeTab,
  onTabChange,
  cartItems
}) => {
  const { toast } = useToast();

  const handleShare = async () => {
    // Create a formatted text of the shopping list
    const listText = cartItems
      .map(item => `${item.quantity}x ${item.name} (${item.price})`)
      .join('\n');
    
    const shareData = {
      title: 'Min inköpslista',
      text: `Kolla in min inköpslista!\n\n${listText}\n\n`,
      url: window.location.href
    };

    try {
      if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
        await navigator.share(shareData);
        toast({
          title: "Delad!",
          description: "Din inköpslista har delats",
        });
      } else {
        // Fallback for browsers that don't support the Web Share API
        const mailtoLink = `mailto:?subject=${encodeURIComponent(shareData.title)}&body=${encodeURIComponent(shareData.text + shareData.url)}`;
        window.open(mailtoLink);
        toast({
          title: "Delning",
          description: "Öppnar e-post för att dela inköpslistan",
        });
      }
    } catch (error) {
      console.error('Error sharing:', error);
      toast({
        title: "Delning misslyckades",
        description: "Det gick inte att dela inköpslistan",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="fixed top-0 left-0 right-0 z-20 bg-white border-b border-gray-200">
      <header className="px-4 pt-6 pb-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-[#1C1C1C]">Inköpslista</h1>
        <button 
          onClick={handleShare}
          className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
          aria-label="Dela inköpslista"
        >
          <Share2 size={20} className="text-gray-700" />
        </button>
      </header>
      
      <ShoppingListTabs 
        activeTab={activeTab} 
        onTabChange={onTabChange} 
      />
    </div>
  );
};
