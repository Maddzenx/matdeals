
import React, { useState, useEffect } from "react";
import { BottomNav } from "@/components/BottomNav";
import { useNavigate } from "react-router-dom";
import { useNavigationState } from "@/hooks/useNavigationState";
import { ShoppingListHeader } from "@/components/ShoppingList/ShoppingListHeader";
import { StorePriceComparison } from "@/components/ShoppingList/StorePriceComparison";
import { ShoppingListItem } from "@/components/ShoppingList/ShoppingListItem";
import { EmptyShoppingList } from "@/components/ShoppingList/EmptyShoppingList";
import { StoreProductGroup } from "@/components/ShoppingList/StoreProductGroup";
import { CategoryProductGroup } from "@/components/ShoppingList/CategoryProductGroup";
import { ConnectedRecipes } from "@/components/ShoppingList/ConnectedRecipes";
import { useStorePriceCalculation } from "@/hooks/useStorePriceCalculation";
import { useStoreGrouping } from "@/hooks/useStoreGrouping";
import { useCategoryGrouping } from "@/hooks/useCategoryGrouping";
import { toast } from "@/components/ui/use-toast";

const ShoppingList = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"category" | "stores">("stores");
  
  const { 
    navItems, 
    cartItems, 
    handleProductQuantityChange,
    handleItemCheck 
  } = useNavigationState();

  const { storePrices, bestStore } = useStorePriceCalculation(cartItems);
  const { groupedByStore, sortedStoreNames } = useStoreGrouping(cartItems);
  const { groupedByCategory, sortedCategoryNames } = useCategoryGrouping(cartItems);

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
            <>
              {sortedStoreNames.map((storeName) => (
                <StoreProductGroup
                  key={storeName}
                  storeName={storeName}
                  items={groupedByStore[storeName]}
                  onItemCheck={handleItemCheck}
                  onIncrement={handleIncrement}
                  onDecrement={handleDecrement}
                />
              ))}
              <ConnectedRecipes cartItems={cartItems} />
            </>
          ) : (
            <>
              {sortedCategoryNames.map((categoryName) => (
                <CategoryProductGroup
                  key={categoryName}
                  categoryName={categoryName}
                  items={groupedByCategory[categoryName]}
                  onItemCheck={handleItemCheck}
                  onIncrement={handleIncrement}
                  onDecrement={handleDecrement}
                />
              ))}
              <ConnectedRecipes cartItems={cartItems} />
            </>
          )}
        </div>
      </div>
      
      <BottomNav items={navItems} onSelect={handleNavSelect} />
    </div>
  );
};

export default ShoppingList;
