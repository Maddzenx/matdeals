
import React, { useState } from "react";
import { BottomNav } from "@/components/BottomNav";
import { useNavigate } from "react-router-dom";
import { useNavigationState, CartItem } from "@/hooks/useNavigationState";

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
      
      <div className="px-4 mb-6">
        <div className="flex rounded-full bg-gray-100 p-1 shadow-sm">
          <button
            className={`flex-1 py-2.5 rounded-full text-center font-medium text-sm transition-colors ${
              activeTab === "recent" ? "bg-white shadow-sm" : "text-gray-600"
            }`}
            onClick={() => setActiveTab("recent")}
          >
            Senaste
          </button>
          <button
            className={`flex-1 py-2.5 rounded-full text-center font-medium text-sm transition-colors ${
              activeTab === "stores" ? "bg-white shadow-sm" : "text-gray-600"
            }`}
            onClick={() => setActiveTab("stores")}
          >
            Butiker
          </button>
        </div>
      </div>
      
      {activeTab === "stores" && (
        <div className="bg-gray-100 mx-4 rounded-xl p-5 mb-6 shadow-sm">
          {stores.map((store) => (
            <div key={store.name} className="flex justify-between py-2.5">
              <span className="font-medium">{store.name}</span>
              <span className="font-semibold">{store.price}</span>
            </div>
          ))}
          <div className="flex justify-between mt-3 pt-3 border-t border-gray-300">
            <span className="font-bold">Du sparar mest på</span>
            <span className="font-bold text-[#DB2C17]">{bestStore.name} {bestStore.savings}</span>
          </div>
        </div>
      )}
      
      <div className="border-b border-gray-200"></div>
      
      <div className="space-y-0 px-4">
        {cartItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <p className="text-lg font-medium text-gray-500 mb-4">Din inköpslista är tom</p>
            <button
              onClick={() => navigate("/")}
              className="text-white text-center text-sm font-bold bg-[#DB2C17] px-4 py-2 rounded-[100px]"
            >
              Gå till erbjudanden
            </button>
          </div>
        ) : (
          cartItems.map((item) => (
            <div key={item.id} className="flex items-center py-4 border-b border-gray-200">
              <button
                onClick={() => handleItemCheck(item.id)}
                className="w-6 h-6 rounded-full border-2 border-gray-300 mr-4 flex-shrink-0 transition-colors duration-200 hover:border-gray-400"
                aria-label={item.checked ? "Mark as incomplete" : "Mark as complete"}
              >
                {item.checked && (
                  <span className="block w-full h-full rounded-full bg-gray-400" />
                )}
              </button>
              
              <div className="flex-grow min-w-0">
                <p className="font-bold text-[#1C1C1C] truncate">{item.name}</p>
                <p className="text-sm text-gray-500">{item.details}</p>
              </div>
              
              <div className="flex items-center gap-4 ml-2">
                <div className="flex items-center">
                  <button
                    onClick={() => handleDecrement(item.id)}
                    className="flex items-center justify-center w-8 h-8 bg-gray-200 rounded-full hover:bg-gray-300 transition-colors"
                    aria-label="Decrease quantity"
                    disabled={item.quantity <= 0}
                  >
                    <span className="text-lg font-bold">-</span>
                  </button>
                  <span className="mx-3 font-medium w-5 text-center">{item.quantity}</span>
                  <button
                    onClick={() => handleIncrement(item.id)}
                    className="flex items-center justify-center w-8 h-8 bg-gray-200 rounded-full hover:bg-gray-300 transition-colors"
                    aria-label="Increase quantity"
                  >
                    <span className="text-lg font-bold">+</span>
                  </button>
                </div>
                <span className="font-medium text-[#1C1C1C] min-w-[50px] text-right">{item.price}</span>
              </div>
            </div>
          ))
        )}
      </div>
      
      <BottomNav items={navItems} onSelect={handleNavSelect} />
    </div>
  );
};

export default ShoppingList;
