
import React, { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Search } from "lucide-react";

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
  const [searchQuery, setSearchQuery] = useState("");
  
  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  // Filter stores based on search query
  const filteredStores = stores.filter(store => 
    store.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Check if all stores are selected
  const allSelected = stores.length > 0 && stores.every(store => 
    activeStoreIds.includes(store.id)
  );

  // Handle select/deselect all
  const handleSelectAll = () => {
    if (allSelected) {
      // Deselect all stores
      stores.forEach(store => {
        if (activeStoreIds.includes(store.id)) {
          onStoreToggle(store.id);
        }
      });
    } else {
      // Select all stores
      stores.forEach(store => {
        if (!activeStoreIds.includes(store.id)) {
          onStoreToggle(store.id);
        }
      });
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
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
          className="absolute right-0 bg-white rounded-md shadow-lg py-1 border border-gray-200 w-64" 
          style={{ 
            zIndex: 999,
            top: "calc(100% + 8px)",
            maxHeight: "calc(100vh - 180px)",
            overflowY: "auto"
          }}
        >
          <div className="px-4 py-3 text-sm font-semibold text-gray-800 border-b border-gray-200 sticky top-0 bg-white">
            Välj butiker
          </div>
          
          <div className="px-4 py-2 sticky top-[44px] bg-white border-b border-gray-100">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Sök butiker..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 h-9 text-sm"
              />
            </div>
          </div>
          
          <div className="max-h-[calc(100vh-240px)] overflow-y-auto">
            <div className="px-4 py-2.5 border-b border-gray-100">
              <label className="flex items-center space-x-3 cursor-pointer">
                <Checkbox
                  id="select-all"
                  checked={allSelected}
                  onCheckedChange={handleSelectAll}
                  className="data-[state=checked]:bg-blue-600"
                />
                <span className="text-sm font-medium text-gray-700">Välj alla</span>
              </label>
            </div>
            
            {filteredStores.length > 0 ? (
              filteredStores.map((store) => (
                <div key={store.id} className="px-4 py-2.5">
                  <label className="flex items-center space-x-3 cursor-pointer">
                    <Checkbox
                      checked={activeStoreIds.includes(store.id)}
                      onCheckedChange={() => onStoreToggle(store.id)}
                      className="data-[state=checked]:bg-blue-600"
                    />
                    <span className="text-sm font-medium text-gray-700">{store.name}</span>
                  </label>
                </div>
              ))
            ) : (
              <div className="px-4 py-3 text-sm text-gray-500 text-center">
                Inga butiker hittades
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
