
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

  return (
    <div className="min-h-screen w-full bg-white pb-20">
      <link
        rel="stylesheet"
        href="https://cdn.jsdelivr.net/npm/@tabler/icons-webfont@latest/dist/tabler-icons.min.css"
      />
      
      <ShoppingListHeader 
        activeTab={activeTab} 
        onTabChange={setActiveTab} 
      />
      
      <div className="pt-[116px]">
        <StorePriceComparison 
          stores={storePrices} 
          bestStore={bestStore} 
        />
        
        <div className="border-b border-gray-200"></div>
        
        <div className="space-y-0 px-4">
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
