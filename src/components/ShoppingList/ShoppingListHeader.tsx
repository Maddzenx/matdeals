
import React from "react";
import { ShoppingListTabs } from "./ShoppingListTabs";

interface ShoppingListHeaderProps {
  activeTab: "recent" | "stores";
  onTabChange: (tab: "recent" | "stores") => void;
}

export const ShoppingListHeader: React.FC<ShoppingListHeaderProps> = ({
  activeTab,
  onTabChange
}) => {
  return (
    <div className="fixed top-0 left-0 right-0 z-20 bg-white">
      <header className="px-4 pt-6 pb-4">
        <h1 className="text-2xl font-bold text-[#1C1C1C]">Inköpslista</h1>
      </header>
      
      <ShoppingListTabs 
        activeTab={activeTab} 
        onTabChange={onTabChange} 
      />
    </div>
  );
};
