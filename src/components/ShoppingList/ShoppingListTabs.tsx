
import React from "react";

interface ShoppingListTabsProps {
  activeTab: "category" | "stores";
  onTabChange: (tab: "category" | "stores") => void;
}

export const ShoppingListTabs: React.FC<ShoppingListTabsProps> = ({
  activeTab,
  onTabChange,
}) => {
  return (
    <div className="px-5 mb-4">
      <div className="flex rounded-full bg-gray-100 p-1.5 shadow-sm">
        <button
          className={`flex-1 py-3 rounded-full text-center font-medium text-base transition-colors ${
            activeTab === "category" ? "bg-white shadow-sm" : "text-gray-600"
          }`}
          onClick={() => onTabChange("category")}
        >
          Kategori
        </button>
        <button
          className={`flex-1 py-3 rounded-full text-center font-medium text-base transition-colors ${
            activeTab === "stores" ? "bg-white shadow-sm" : "text-gray-600"
          }`}
          onClick={() => onTabChange("stores")}
        >
          Butiker
        </button>
      </div>
    </div>
  );
};
