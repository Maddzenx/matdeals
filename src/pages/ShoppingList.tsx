import React, { useState, useEffect } from "react";
import { BottomNav, NavItem } from "@/components/BottomNav";
import { useNavigate } from "react-router-dom";
import { ShoppingCart, Search, BookOpen, Percent, User } from "lucide-react";

interface StorePrice {
  name: string;
  price: string;
}

interface ShoppingItem {
  id: string;
  name: string;
  details: string;
  quantity: number;
  price: string;
  checked: boolean;
}

const ShoppingList = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"recent" | "stores">("recent");
  const [navItems, setNavItems] = useState<NavItem[]>([
    { id: "offers", icon: "discount", label: "Erbjudanden" },
    { id: "recipes", icon: "book", label: "Recept" },
    { id: "menu", icon: "search", label: "Matsedel" },
    { id: "cart", icon: "shopping-cart", label: "Inköpslista", badge: 0, active: true },
    { id: "profile", icon: "user", label: "Profil" },
  ]);

  const [stores, setStores] = useState<StorePrice[]>([
    { name: "Coop", price: "156 kr" },
    { name: "ICA", price: "101 kr" },
  ]);

  const [bestStore, setBestStore] = useState({ name: "Coop", savings: "55 kr" });

  const [items, setItems] = useState<ShoppingItem[]>([
    { id: "1", name: "Bregott", details: "Arla, 250g", quantity: 1, price: "33 kr", checked: false },
    { id: "2", name: "Bregott", details: "Arla, 250g", quantity: 1, price: "33 kr", checked: false },
    { id: "3", name: "Bregott", details: "Arla, 250g", quantity: 1, price: "33 kr", checked: false },
    { id: "4", name: "Bregott", details: "Arla, 250g", quantity: 1, price: "33 kr", checked: false },
    { id: "5", name: "Bregott", details: "Arla, 250g", quantity: 1, price: "33 kr", checked: false },
    { id: "6", name: "Bregott", details: "Arla, 250g", quantity: 1, price: "33 kr", checked: false },
  ]);

  useEffect(() => {
    const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
    
    setNavItems(prev => 
      prev.map(item => 
        item.id === "cart" 
          ? { ...item, badge: totalItems > 0 ? totalItems : undefined }
          : item
      )
    );
  }, [items]);

  const handleNavSelect = (id: string) => {
    if (id === "offers") {
      navigate("/");
    } else if (id === "cart") {
      // Already on shopping list page
    } else {
      console.log("Selected nav:", id);
    }
  };

  const handleIncrement = (id: string) => {
    setItems(
      items.map((item) =>
        item.id === id ? { ...item, quantity: item.quantity + 1 } : item
      )
    );
  };

  const handleDecrement = (id: string) => {
    setItems(
      items.map((item) =>
        item.id === id && item.quantity > 0
          ? { ...item, quantity: item.quantity - 1 }
          : item
      )
    );
  };

  const handleCheckItem = (id: string) => {
    setItems(
      items.map((item) =>
        item.id === id ? { ...item, checked: !item.checked } : item
      )
    );
  };

  return (
    <div className="min-h-screen w-full bg-white pb-20">
      <header className="bg-white px-4 py-4">
        <h1 className="text-2xl font-bold text-[#1C1C1C]">Inköpslista</h1>
      </header>
      
      <div className="px-4 mb-4">
        <div className="flex rounded-full bg-gray-100 p-1">
          <button
            className={`flex-1 py-3 rounded-full text-center font-bold ${
              activeTab === "recent" ? "bg-white shadow-sm" : ""
            }`}
            onClick={() => setActiveTab("recent")}
          >
            Senaste
          </button>
          <button
            className={`flex-1 py-3 rounded-full text-center font-bold ${
              activeTab === "stores" ? "bg-white shadow-sm" : ""
            }`}
            onClick={() => setActiveTab("stores")}
          >
            Butiker
          </button>
        </div>
      </div>
      
      <div className="bg-gray-100 mx-4 rounded-xl p-4 mb-6">
        {stores.map((store) => (
          <div key={store.name} className="flex justify-between py-2">
            <span className="font-medium">{store.name}</span>
            <span className="font-medium">{store.price}</span>
          </div>
        ))}
        <div className="flex justify-between mt-2 pt-3 border-t border-gray-300">
          <span className="font-bold">Du sparar mest på</span>
          <span className="font-bold text-[#DB2C17]">{bestStore.name} {bestStore.savings}</span>
        </div>
      </div>
      
      <div className="space-y-4 px-4">
        {items.map((item) => (
          <div key={item.id} className="flex items-center">
            <button
              onClick={() => handleCheckItem(item.id)}
              className={`w-6 h-6 rounded-full border-2 border-gray-300 mr-3 flex-shrink-0 ${
                item.checked ? "bg-gray-300" : "bg-white"
              }`}
            ></button>
            
            <div className="flex-grow">
              <p className="font-bold">{item.name}</p>
              <p className="text-sm text-gray-500">{item.details}</p>
            </div>
            
            <div className="flex items-center gap-2">
              <div className="flex items-center">
                <button
                  onClick={() => handleDecrement(item.id)}
                  className="flex items-center justify-center w-8 h-8 bg-gray-200 rounded-full"
                >
                  <span className="text-lg font-bold">-</span>
                </button>
                <span className="mx-4 font-bold">{item.quantity}</span>
                <button
                  onClick={() => handleIncrement(item.id)}
                  className="flex items-center justify-center w-8 h-8 bg-gray-200 rounded-full"
                >
                  <span className="text-lg font-bold">+</span>
                </button>
              </div>
              <span className="ml-2 font-bold">{item.price}</span>
            </div>
          </div>
        ))}
      </div>
      
      <BottomNav items={navItems} onSelect={handleNavSelect} />
    </div>
  );
};

export default ShoppingList;
