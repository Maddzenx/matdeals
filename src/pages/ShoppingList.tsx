
import React, { useState, useEffect } from "react";
import { BottomNav } from "@/components/BottomNav";
import { useNavigate } from "react-router-dom";
import { useNavigationState } from "@/hooks/useNavigationState";
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

  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Calculate total price for each store
  const calculateStorePrices = () => {
    const storePrices: Record<string, number> = {};
    
    cartItems.forEach(item => {
      const store = item.store || "Other";
      const priceValue = parseFloat(item.price.replace(/[^0-9,.]/g, '').replace(',', '.'));
      
      if (!isNaN(priceValue)) {
        if (!storePrices[store]) {
          storePrices[store] = 0;
        }
        storePrices[store] += priceValue * item.quantity;
      }
    });
    
    return Object.entries(storePrices).map(([name, total]) => ({
      name,
      price: `${total.toFixed(0)} kr`
    }));
  };

  // Find store with best savings
  const findBestStore = (stores: StorePrice[]) => {
    if (stores.length <= 1) {
      return { name: stores[0]?.name || "N/A", savings: "0 kr" };
    }
    
    // Sort stores by price (lowest first)
    const sortedStores = [...stores].sort((a, b) => {
      const aPrice = parseFloat(a.price.replace(/[^0-9,.]/g, '').replace(',', '.'));
      const bPrice = parseFloat(b.price.replace(/[^0-9,.]/g, '').replace(',', '.'));
      return aPrice - bPrice;
    });
    
    // Calculate savings between cheapest and second cheapest
    const cheapestPrice = parseFloat(sortedStores[0].price.replace(/[^0-9,.]/g, '').replace(',', '.'));
    const secondPrice = parseFloat(sortedStores[1].price.replace(/[^0-9,.]/g, '').replace(',', '.'));
    const savings = secondPrice - cheapestPrice;
    
    return {
      name: sortedStores[0].name,
      savings: `${savings.toFixed(0)} kr`
    };
  };

  const stores = calculateStorePrices();
  const bestStore = findBestStore(stores);

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

  // Group products by store
  const groupedByStore = cartItems.reduce((acc, item) => {
    const storeName = item.store || "Other";
    if (!acc[storeName]) {
      acc[storeName] = [];
    }
    acc[storeName].push(item);
    return acc;
  }, {} as Record<string, typeof cartItems>);

  // Sort store names alphabetically for consistent display
  const sortedStoreNames = Object.keys(groupedByStore).sort();

  return (
    <div className="min-h-screen w-full bg-white pb-20">
      <link
        rel="stylesheet"
        href="https://cdn.jsdelivr.net/npm/@tabler/icons-webfont@latest/dist/tabler-icons.min.css"
      />
      
      <div className="fixed top-0 left-0 right-0 z-20 bg-white">
        <header className="px-4 pt-6 pb-4">
          <h1 className="text-2xl font-bold text-[#1C1C1C]">Inköpslista</h1>
        </header>
        
        <ShoppingListTabs 
          activeTab={activeTab} 
          onTabChange={setActiveTab} 
        />
      </div>
      
      <div className="pt-[116px]">
        <StorePriceComparison 
          stores={stores} 
          bestStore={bestStore} 
        />
        
        <div className="border-b border-gray-200"></div>
        
        <div className="space-y-0 px-4">
          {cartItems.length === 0 ? (
            <EmptyShoppingList />
          ) : activeTab === "stores" ? (
            // Stores view - Group by store with sorted order
            sortedStoreNames.map((storeName) => (
              <div key={storeName} className="mt-4">
                <h2 className="text-lg font-semibold mb-2">{storeName}</h2>
                {groupedByStore[storeName].map((item) => (
                  <ShoppingListItem
                    key={item.id}
                    item={item}
                    onItemCheck={handleItemCheck}
                    onIncrement={handleIncrement}
                    onDecrement={handleDecrement}
                  />
                ))}
              </div>
            ))
          ) : (
            // Recent view - No grouping
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
