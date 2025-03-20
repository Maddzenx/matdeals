
import React, { useState, useEffect } from "react";
import { StoreSelector } from "./StoreSelector";
import { storeTagsData } from "@/data/productData";

interface SearchBarProps {
  onSearch?: (query: string) => void;
  activeStoreIds?: string[];
  onStoreToggle?: (storeId: string) => void;
}

export const SearchBar: React.FC<SearchBarProps> = ({ 
  onSearch, 
  activeStoreIds = [], 
  onStoreToggle = () => {} 
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  
  // Debounce search input to avoid excessive callbacks
  useEffect(() => {
    const timer = setTimeout(() => {
      if (onSearch) {
        onSearch(searchQuery);
      }
    }, 300); // 300ms debounce
    
    return () => clearTimeout(timer);
  }, [searchQuery, onSearch]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
  };

  return (
    <div className="sticky top-0 z-20 bg-white flex gap-3 items-center px-4 py-2 border-b border-gray-100">
      <div className="flex items-center flex-1 gap-2 bg-neutral-100 px-3.5 py-2.5 rounded-full">
        <i className="ti ti-search text-[#6E6E6E]" />
        <input
          type="text"
          placeholder="Search"
          value={searchQuery}
          onChange={handleInputChange}
          className="bg-transparent border-none outline-none w-full text-sm font-medium text-[#6E6E6E]"
        />
      </div>
      <StoreSelector
        stores={storeTagsData}
        activeStoreIds={activeStoreIds}
        onStoreToggle={onStoreToggle}
        className="flex-shrink-0"
      />
    </div>
  );
};
