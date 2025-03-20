
import React, { useState, useEffect } from "react";
import { BottomNav } from "@/components/BottomNav";
import { useNavigate } from "react-router-dom";
import { useNavigationState } from "@/hooks/useNavigationState";
import { ShoppingListHeader } from "@/components/ShoppingList/ShoppingListHeader";
import { StorePriceComparison } from "@/components/ShoppingList/StorePriceComparison";
import { ShoppingListContent } from "@/components/ShoppingList/ShoppingListContent";
import { useStorePriceCalculation } from "@/hooks/useStorePriceCalculation";
import { useStoreGrouping } from "@/hooks/useStoreGrouping";
import { useCategoryGrouping } from "@/hooks/useCategoryGrouping";
import { useShoppingListSharing } from "@/components/ShoppingList/ShoppingListSharing";
import { useProductHandler } from "@/components/ShoppingList/useProductHandler";

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
  
  // Extract product handlers to a custom hook
  const productHandlers = useProductHandler({
    cartItems,
    handleProductQuantityChange,
    handleItemCheck
  });

  // Extract sharing functionality to a custom hook
  const { handleShareList } = useShoppingListSharing({
    cartItems,
    storePrices
  });

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
        
        <ShoppingListContent
          activeTab={activeTab}
          cartItems={cartItems}
          handleItemCheck={productHandlers.handleItemCheck}
          handleIncrement={productHandlers.handleIncrement}
          handleDecrement={productHandlers.handleDecrement}
          handleSetQuantity={productHandlers.handleSetQuantity}
          groupedByStore={groupedByStore}
          sortedStoreNames={sortedStoreNames}
          groupedByCategory={groupedByCategory}
          sortedCategoryNames={sortedCategoryNames}
        />
      </div>
      
      <BottomNav items={navItems} onSelect={handleNavSelect} />
    </div>
  );
};

export default ShoppingList;
