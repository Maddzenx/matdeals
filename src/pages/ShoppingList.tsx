
import React from "react";
import { BottomNav, NavItem } from "@/components/BottomNav";
import { useNavigate } from "react-router-dom";

const ShoppingList = () => {
  const navigate = useNavigate();
  const [navItems, setNavItems] = React.useState<NavItem[]>([
    { id: "offers", icon: "discount", label: "Erbjudanden" },
    { id: "recipes", icon: "book", label: "Recept" },
    { id: "menu", icon: "search", label: "Matsedel" },
    { id: "cart", icon: "shopping-cart", label: "Inköpslista", badge: 1, active: true },
    { id: "profile", icon: "user", label: "Profil" },
  ]);

  const handleNavSelect = (id: string) => {
    if (id === "offers") {
      navigate("/");
    } else if (id === "cart") {
      // Already on shopping list page
    } else {
      console.log("Selected nav:", id);
    }
  };

  // This is a placeholder for your Figma design
  // Replace this with your actual design implementation
  return (
    <div className="min-h-screen w-full bg-white pb-20">
      <header className="bg-white shadow-sm px-4 py-4">
        <h1 className="text-xl font-bold text-[#1C1C1C]">Inköpslista</h1>
      </header>
      
      <main className="p-4">
        {/* Replace this with your Figma design implementation */}
        <div className="space-y-4">
          <div className="bg-white shadow-md rounded-lg p-4">
            <h2 className="text-base font-bold mb-2">Hemköp Stadshagen</h2>
            <ul className="space-y-3">
              <li className="flex justify-between items-center border-b pb-2">
                <div>
                  <p className="font-medium">Bregott</p>
                  <p className="text-sm text-gray-500">Arla, 250g</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-bold">30 kr/st</span>
                  <div className="flex items-center h-8 bg-neutral-100 px-1 rounded-full">
                    <button className="flex-1 text-center text-sm font-bold bg-white px-2 py-1.5 rounded-full">-</button>
                    <span className="flex-1 text-center text-sm font-bold">1 st</span>
                    <button className="flex-1 text-center text-sm font-bold text-white bg-[#DB2C17] px-2 py-1.5 rounded-full">+</button>
                  </div>
                </div>
              </li>
              <li className="flex justify-between items-center">
                <div>
                  <p className="font-medium">Mozzarella</p>
                  <p className="text-sm text-gray-500">Galbani, 226g</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-bold">10 kr/st</span>
                  <div className="flex items-center h-8 bg-neutral-100 px-1 rounded-full">
                    <button className="flex-1 text-center text-sm font-bold bg-white px-2 py-1.5 rounded-full">-</button>
                    <span className="flex-1 text-center text-sm font-bold">1 st</span>
                    <button className="flex-1 text-center text-sm font-bold text-white bg-[#DB2C17] px-2 py-1.5 rounded-full">+</button>
                  </div>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </main>
      
      <BottomNav items={navItems} onSelect={handleNavSelect} />
    </div>
  );
};

export default ShoppingList;
