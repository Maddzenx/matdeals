
import React from "react";

interface StoreTag {
  id: string;
  name: string;
}

interface StoreTagsProps {
  tags: StoreTag[];
  onRemove: (id: string) => void;
}

export const StoreTags: React.FC<StoreTagsProps> = ({ tags, onRemove }) => {
  return (
    <div className="flex gap-2 overflow-x-auto whitespace-nowrap mb-3 px-4 py-0 no-scrollbar mt-2">
      {tags.map((tag) => (
        <div
          key={tag.id}
          className="flex-shrink-0 flex items-center gap-2 text-sm font-bold text-[#191919] bg-neutral-100 px-3 py-1.5 rounded-[100px]"
        >
          <span className="truncate">{tag.name}</span>
          <button
            onClick={() => onRemove(tag.id)}
            className="focus:outline-none"
            aria-label={`Remove ${tag.name}`}
          >
            <i className="ti ti-x text-base" />
          </button>
        </div>
      ))}
    </div>
  );
};
