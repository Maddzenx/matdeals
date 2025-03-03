
import React, { useState, useEffect } from "react";
import { BottomNav } from "@/components/BottomNav";
import { useNavigate } from "react-router-dom";
import { SearchBar } from "@/components/SearchBar";
import { categoriesData, productsData } from "@/data/productData";
import { useProductUtils } from "@/hooks/useProductUtils";
import { NavItem } from "@/components/BottomNav";

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
  const [activeTab, setActiveTab] = useState<"recent" | "stores">("stores");
  const [activeCategory, setActiveCategory] = useState("fruits");
  const [navItems, setNavItems] = useState<NavItem[]>([
    { id: "offers", icon: "discount", label: "Erbjudanden" },
    { id: "recipes", icon: "book", label: "Recept" },
    { id: "menu", icon: "search", label: "Matsedel" },
    { id: "cart", icon: "shopping-cart", label: "Inköpslista", badge: 6, active: true },
    { id: "profile", icon: "user", label: "Profil" },
  ]);

  const [stores, setStores] = useState<StorePrice[]>([
    { name: "Coop", price: "156 kr" },
    { name: "ICA", price: "101 kr" },
  ]);

  const [bestStore, setBestStore] = useState({ name: "Coop", savings: "55 kr" });

  const [items, setItems] = useState<ShoppingItem[]>([
    { id: "1", name: "Bregott", details: "Arla, 250g", quantity: 1, price: "33 kr", checked: false },
    { id: "2", name: "Milk", details: "Arla, 1L", quantity: 1, price: "15 kr", checked: false },
    { id: "3", name: "Bread", details: "Pågen, 800g", quantity: 1, price: "28 kr", checked: false },
    { id: "4", name: "Cheese", details: "Präst, 500g", quantity: 1, price: "65 kr", checked: false },
    { id: "5", name: "Eggs", details: "Kronägg, 12-pack", quantity: 1, price: "39 kr", checked: false },
    { id: "6", name: "Yogurt", details: "Valio, 1L", quantity: 1, price: "22 kr", checked: false },
  ]);
  
  const { getProductsWithCategories, scrollToCategory } = useProductUtils(categoriesData);
  const allProducts = getProductsWithCategories();

  useEffect(() => {
    const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
    
    setNavItems(prev => 
      prev.map(item => 
        item.id === "cart" 
          ? { ...item, badge: totalItems > 0 ? totalItems : undefined, active: true }
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
        {items.map((item) => (
          <div key={item.id} className="flex items-center py-4 border-b border-gray-200">
            <button
              onClick={() => handleCheckItem(item.id)}
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
        ))}
      </div>
      
      <BottomNav items={navItems} onSelect={handleNavSelect} />
    </div>
  );
};

export default ShoppingList;
