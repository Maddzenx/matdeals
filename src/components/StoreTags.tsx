
import React from "react";

interface StoreTag {
  id: string;
  name: string;
}

// Swedish translations for store names
const translateStore = (name: string): string => {
  const translations: Record<string, string> = {
    "Coop": "Coop",
    "ICA": "ICA",
    "Lidl": "Lidl",
    "Willys": "Willys",
    "Hemköp": "Hemköp",
    "City Gross": "City Gross"
  };

  return translations[name] || name;
};

interface StoreTagsProps {
  tags: StoreTag[];
  onRemove: (id: string) => void;
}

export const StoreTags: React.FC<StoreTagsProps> = ({ tags, onRemove }) => {
  if (tags.length === 0) return null;
  
  return (
    <div className="flex gap-2 overflow-x-auto whitespace-nowrap mb-3 px-4 py-0 no-scrollbar mt-2">
      {tags.map((tag) => (
        <div
          key={tag.id}
          className="flex-shrink-0 flex items-center gap-2 text-sm font-medium text-[#191919] bg-neutral-100 px-3.5 py-2 rounded-full"
        >
          <span className="truncate">{translateStore(tag.name)}</span>
          <button
            onClick={() => onRemove(tag.id)}
            className="focus:outline-none hover:bg-neutral-200 rounded-full w-5 h-5 flex items-center justify-center"
            aria-label={`Ta bort ${translateStore(tag.name)}`}
          >
            <i className="ti ti-x text-sm" />
          </button>
        </div>
      ))}
    </div>
  );
};
