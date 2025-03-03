
import React, { useState } from "react";
import { BottomNav } from "@/components/BottomNav";
import { useNavigate } from "react-router-dom";
import { useNavigationState, CartItem } from "@/hooks/useNavigationState";
import { ShoppingListTabs } from "@/components/ShoppingList/ShoppingListTabs";
import { StorePriceComparison } from "@/components/ShoppingList/StorePriceComparison";
import { ShoppingListItem } from "@/components/ShoppingList/ShoppingListItem";
import { EmptyShoppingList } from "@/components/ShoppingList/EmptyShoppingList";

interface StorePrice {
  name: string;
  price: string;
}

const ShoppingList = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"recent" | "stores">("stores");
  
  const { 
    navItems, 
    cartItems, 
    handleProductQuantityChange,
    handleItemCheck 
  } = useNavigationState();

  const [stores, setStores] = useState<StorePrice[]>([
    { name: "Coop", price: "156 kr" },
    { name: "ICA", price: "101 kr" },
  ]);

  const [bestStore, setBestStore] = useState({ name: "Coop", savings: "55 kr" });

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
          image: item.image
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
          image: item.image
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
      
      <header className="px-4 pt-6 pb-4 sticky top-0 bg-white z-10">
        <h1 className="text-2xl font-bold text-[#1C1C1C]">Inköpslista</h1>
      </header>
      
      <ShoppingListTabs 
        activeTab={activeTab} 
        onTabChange={setActiveTab} 
      />
      
      {activeTab === "stores" && (
        <StorePriceComparison 
          stores={stores} 
          bestStore={bestStore} 
        />
      )}
      
      <div className="border-b border-gray-200"></div>
      
      <div className="space-y-0 px-4">
        {cartItems.length === 0 ? (
          <EmptyShoppingList />
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
      
      <BottomNav items={navItems} onSelect={handleNavSelect} />
    </div>
  );
};

export default ShoppingList;
