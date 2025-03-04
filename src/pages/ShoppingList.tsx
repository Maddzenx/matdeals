
import React, { useState, useEffect } from "react";
import { BottomNav } from "@/components/BottomNav";
import { useNavigate } from "react-router-dom";
import { useNavigationState } from "@/hooks/useNavigationState";
import { ShoppingListHeader } from "@/components/ShoppingList/ShoppingListHeader";
import { StorePriceComparison } from "@/components/ShoppingList/StorePriceComparison";
import { ShoppingListItem } from "@/components/ShoppingList/ShoppingListItem";
import { EmptyShoppingList } from "@/components/ShoppingList/EmptyShoppingList";
import { StoreProductGroup } from "@/components/ShoppingList/StoreProductGroup";
import { useStorePriceCalculation } from "@/hooks/useStorePriceCalculation";
import { useStoreGrouping } from "@/hooks/useStoreGrouping";
import { toast } from "sonner";

const ShoppingList = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"recent" | "stores">("stores");
  
  const { 
    navItems, 
    cartItems, 
    handleProductQuantityChange,
    handleItemCheck 
  } = useNavigationState();

  const { storePrices, bestStore } = useStorePriceCalculation(cartItems);
  const { groupedByStore, sortedStoreNames } = useStoreGrouping(cartItems);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleNavSelect = (id: string) => {
    if (id === "offers") {
      navigate("/");
    } else if (id === "profile") {
      navigate("/auth");
    } else {
      console.log("Selected nav:", id);
    }
  };

  const handleIncrement = (id: string) => {
    const item = cartItems.find(item => item.id === id);
    if (item) {
      handleProductQuantityChange(
        id, 
        item.quantity + 1, 
        item.quantity,
        {
          name: item.name,
          details: item.details,
          price: item.price,
          image: item.image,
          store: item.store
        }
      );
    }
  };

  const handleDecrement = (id: string) => {
    const item = cartItems.find(item => item.id === id);
    if (item && item.quantity > 0) {
      handleProductQuantityChange(
        id, 
        Math.max(0, item.quantity - 1), 
        item.quantity,
        {
          name: item.name,
          details: item.details,
          price: item.price,
          image: item.image,
          store: item.store
        }
      );
    }
  };

  const handleShareList = async () => {
    // Create a formatted text of the shopping list
    const listText = cartItems.map(item => 
      `${item.name} - ${item.quantity} st (${item.price})`
    ).join('\n');
    
    const shareData = {
      title: 'Min inköpslista',
      text: `Kolla in min inköpslista!\n\n${listText}\n\nTotalt: ${storePrices.length > 0 ? storePrices[0].price : '0:00 kr'}`,
      url: window.location.href
    };

    // Try to use Web Share API if available
    if (navigator.share && navigator.canShare(shareData)) {
      try {
        await navigator.share(shareData);
        toast.success("Inköpslistan delad!");
      } catch (err) {
        console.error("Error sharing:", err);
        shareViaEmail(shareData);
      }
    } else {
      // Fallback to email
      shareViaEmail(shareData);
    }
  };

  const shareViaEmail = (shareData: { title: string, text: string }) => {
    const mailtoLink = `mailto:?subject=${encodeURIComponent(shareData.title)}&body=${encodeURIComponent(shareData.text)}`;
    window.open(mailtoLink);
    toast.success("Inköpslistan öppnad i email!");
  };

  return (
    <div className="min-h-screen w-full bg-white pb-28">
      <link
        rel="stylesheet"
        href="https://cdn.jsdelivr.net/npm/@tabler/icons-webfont@latest/dist/tabler-icons.min.css"
      />
      
      <ShoppingListHeader 
        activeTab={activeTab} 
        onTabChange={setActiveTab}
        cartItems={cartItems}
        onShare={handleShareList}
      />
      
      <div className="pt-[136px] pb-4">
        <StorePriceComparison 
          stores={storePrices} 
          bestStore={bestStore} 
        />
        
        <div className="space-y-0 px-4 mt-4">
          {cartItems.length === 0 ? (
            <EmptyShoppingList />
          ) : activeTab === "stores" ? (
            sortedStoreNames.map((storeName) => (
              <StoreProductGroup
                key={storeName}
                storeName={storeName}
                items={groupedByStore[storeName]}
                onItemCheck={handleItemCheck}
                onIncrement={handleIncrement}
                onDecrement={handleDecrement}
              />
            ))
          ) : (
            cartItems.map((item) => (
              <ShoppingListItem
                key={item.id}
                item={item}
                onItemCheck={handleItemCheck}
                onIncrement={handleIncrement}
                onDecrement={handleDecrement}
              />
            ))
          )}
        </div>
      </div>
      
      <BottomNav items={navItems} onSelect={handleNavSelect} />
    </div>
  );
};

export default ShoppingList;
