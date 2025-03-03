
import React from "react";

export const SearchBar = () => {
  return (
    <div className="sticky top-0 z-20 bg-white flex gap-2 items-center px-4 py-2.5">
      <div className="flex items-center flex-1 gap-2 text-[#6E6E6E] text-sm font-bold bg-neutral-100 px-3 py-2.5 rounded-lg">
        <i className="ti ti-search" />
        <span>Search</span>
      </div>
      <button
        className="w-10 h-10 flex items-center justify-center bg-neutral-100 rounded-[100px]"
        aria-label="Filter"
      >
        <i className="ti ti-adjustments" />
      </button>
    </div>
  );
};
