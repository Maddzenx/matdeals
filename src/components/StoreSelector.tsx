
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
        className="w-10 h-10 flex items-center justify-center bg-neutral-100 rounded-[100px]"
        aria-label="Select stores"
        aria-expanded={isOpen}
      >
        <i className="ti ti-adjustments" />
      </button>

      {isOpen && (
        <div 
          className="fixed right-4 bg-white rounded-md shadow-lg py-1 border border-gray-200 w-64" 
          style={{ 
            zIndex: 999, 
            top: "70px",
            maxHeight: "calc(100vh - 120px)",
            overflowY: "auto"
          }}
        >
          <div className="px-4 py-3 text-sm font-semibold text-gray-800 border-b border-gray-200 sticky top-0 bg-white">
            Välj butiker
          </div>
          <div className="max-h-[calc(100vh-180px)] overflow-y-auto">
            {stores.map((store) => (
              <div key={store.id} className="px-4 py-2.5">
                <label className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={activeStoreIds.includes(store.id)}
                    onChange={() => onStoreToggle(store.id)}
                    className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm font-medium text-gray-700">{store.name}</span>
                </label>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
