
import React from "react";
import { Separator } from "@/components/ui/separator";

interface RecipeCategoryTabsProps {
  categories: string[];
  activeCategory: string;
  onCategoryChange: (category: string) => void;
}

export const RecipeCategoryTabs: React.FC<RecipeCategoryTabsProps> = ({
  categories,
  activeCategory,
  onCategoryChange
}) => {
  return (
    <div className="px-4 pb-1">
      <div className="flex space-x-6 overflow-x-auto pb-2 no-scrollbar">
        {categories.map((category) => (
          <button
            key={category}
            className={`pb-2 px-1 font-medium text-sm whitespace-nowrap transition-colors ${
              activeCategory === category 
                ? "text-[#DB2C17] border-b-2 border-[#DB2C17]" 
                : "text-gray-500"
            }`}
            onClick={() => onCategoryChange(category)}
          >
            {category}
          </button>
        ))}
      </div>
      <Separator />
    </div>
  );
};
