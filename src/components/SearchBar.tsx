
import React, { useState } from "react";
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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    if (onSearch) {
      onSearch(value);
    }
  };

  return (
    <div className="sticky top-0 z-20 bg-white flex gap-2 items-center px-4 py-2.5">
      <div className="flex items-center flex-1 gap-2 bg-neutral-100 px-3 py-2.5 rounded-lg">
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
