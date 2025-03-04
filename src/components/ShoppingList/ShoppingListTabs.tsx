
import React from "react";

interface ShoppingListTabsProps {
  activeTab: "recent" | "stores";
  onTabChange: (tab: "recent" | "stores") => void;
}

export const ShoppingListTabs: React.FC<ShoppingListTabsProps> = ({
  activeTab,
  onTabChange,
}) => {
  return (
    <div className="px-4 mb-4">
      <div className="flex rounded-full bg-gray-100 p-1 shadow-sm">
        <button
          className={`flex-1 py-2.5 rounded-full text-center font-medium text-sm transition-colors ${
            activeTab === "recent" ? "bg-white shadow-sm" : "text-gray-600"
          }`}
          onClick={() => onTabChange("recent")}
        >
          Senaste
        </button>
        <button
          className={`flex-1 py-2.5 rounded-full text-center font-medium text-sm transition-colors ${
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
