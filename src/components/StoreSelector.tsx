
import React, { useState } from "react";
import { cn } from "@/lib/utils";

interface StoreSelectorProps {
  stores: { id: string; name: string }[];
  activeStoreIds: string[];
  onStoreToggle: (storeId: string) => void;
  className?: string;
}

export const StoreSelector: React.FC<StoreSelectorProps> = ({
  stores,
  activeStoreIds,
  onStoreToggle,
  className,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  // Close dropdown when clicking outside
  React.useEffect(() => {
    const closeDropdown = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest("[data-store-selector]")) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("click", closeDropdown);
    }

    return () => {
      document.removeEventListener("click", closeDropdown);
    };
  }, [isOpen]);

  return (
    <div className={cn("relative", className)} data-store-selector>
      <button
        onClick={toggleDropdown}
        className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
        aria-label="Select stores"
        aria-expanded={isOpen}
      >
        <img 
          src="/lovable-uploads/8ba1b803-c207-49d9-bf65-37064d3528d8.png" 
          alt="Store selection" 
          className="w-5 h-5" 
        />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 bg-white rounded-md shadow-lg z-30 py-1 border border-gray-200">
          <div className="px-3 py-2 text-sm font-semibold text-gray-700 border-b border-gray-200">
            Välj butiker
          </div>
          <div className="max-h-60 overflow-y-auto">
            {stores.map((store) => (
              <div key={store.id} className="px-3 py-2">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={activeStoreIds.includes(store.id)}
                    onChange={() => onStoreToggle(store.id)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">{store.name}</span>
                </label>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
