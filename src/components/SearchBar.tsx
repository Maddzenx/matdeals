
import React, { useState, useEffect } from "react";
import { Search, Store, X } from "lucide-react";
import { StoreSelector } from "@/components/StoreSelector";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface SearchBarProps {
  activeStoreIds: string[];
  onStoreToggle: (storeId: string) => void;
  onSearch: (searchQuery: string) => void;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  activeStoreIds,
  onStoreToggle,
  onSearch,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [stores, setStores] = useState([
    { id: "willys", name: "Willys" },
    { id: "willys johanneberg", name: "Willys Johanneberg" },
    { id: "hemkop", name: "Hemköp" },
    { id: "ica", name: "ICA" },
    { id: "coop", name: "Coop" },
  ]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(searchQuery);
  };

  const handleClearSearch = () => {
    setSearchQuery("");
    onSearch("");
  };

  // Auto-submit search after typing stops for 500ms
  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      onSearch(searchQuery);
    }, 500);
    
    return () => clearTimeout(debounceTimer);
  }, [searchQuery, onSearch]);

  return (
    <div className="bg-white px-4 py-3 border-b border-gray-100">
      <form onSubmit={handleSearchSubmit} className="flex items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <Input
            type="text"
            placeholder="Sök erbjudanden..."
            value={searchQuery}
            onChange={handleSearchChange}
            className="pl-10 h-11 pr-10 w-full rounded-xl focus:ring-blue-500 bg-neutral-100 border-none"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={handleClearSearch}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 hover:text-gray-600"
            >
              <X size={18} />
            </button>
          )}
        </div>
        <StoreSelector
          stores={stores}
          activeStoreIds={activeStoreIds}
          onStoreToggle={onStoreToggle}
          className="ml-2"
        />
      </form>
    </div>
  );
};
