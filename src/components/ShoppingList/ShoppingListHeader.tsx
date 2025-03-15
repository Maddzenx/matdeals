
import React from "react";
import { CartItem } from "@/hooks/useCartState";
import { ShoppingListTabs } from "./ShoppingListTabs";

interface ShoppingListHeaderProps {
  activeTab: "recent" | "stores";
  onTabChange: (tab: "recent" | "stores") => void;
  cartItems: CartItem[];
  onShare?: () => void;
}

export const ShoppingListHeader: React.FC<ShoppingListHeaderProps> = ({
  activeTab,
  onTabChange,
  cartItems,
  onShare
}) => {
  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const itemsText = totalItems === 1 ? "vara" : "varor";

  return (
    <div className="fixed top-0 left-0 right-0 z-20 bg-white border-b border-gray-200">
      <div className="px-4 pt-4 pb-2 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#1C1C1C]">Inköpslista</h1>
          <p className="text-sm text-gray-500">
            {totalItems} {itemsText}
          </p>
        </div>
        {onShare && (
          <button 
            onClick={onShare}
            className="flex items-center justify-center bg-[#DB2C17] text-white p-2 rounded-full hover:bg-[#c02615] transition-colors"
            aria-label="Dela inköpslista"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"></path>
              <polyline points="16 6 12 2 8 6"></polyline>
              <line x1="12" y1="2" x2="12" y2="15"></line>
            </svg>
          </button>
        )}
      </div>
      
      <ShoppingListTabs 
        activeTab={activeTab} 
        onTabChange={onTabChange}
      />
    </div>
  );
};
