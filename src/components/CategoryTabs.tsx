
import React from "react";

interface Category {
  id: string;
  name: string;
}

interface CategoryTabsProps {
  categories: Category[];
  activeCategory: string;
  onSelect: (id: string) => void;
}

export const CategoryTabs: React.FC<CategoryTabsProps> = ({
  categories,
  activeCategory,
  onSelect,
}) => {
  return (
    <div className="sticky top-[60px] z-10 bg-white flex overflow-x-auto gap-6 px-4 py-0 border-b-[#EEE] border-b border-solid">
      {categories.map((category) => (
        <button
          key={category.id}
          onClick={() => onSelect(category.id)}
          className={`text-sm font-bold whitespace-nowrap px-0 py-2 ${
            activeCategory === category.id ? "text-[#191919]" : "text-[#6E6E6E]"
          }`}
        >
          {category.name}
        </button>
      ))}
    </div>
  );
};
