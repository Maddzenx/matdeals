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
    <div className="sticky top-[70px] z-10 bg-white flex overflow-x-auto gap-6 px-4 py-2 border-b-[#EEE] border-b border-solid no-scrollbar mt-3">
      {categories.map((category) => (
        <button
          key={category.id}
          onClick={() => onSelect(category.id)}
          className={`text-sm font-bold whitespace-nowrap px-1 py-1 transition-colors ${
            activeCategory === category.id 
              ? "text-[#191919] border-b-2 border-[#191919]" 
              : "text-[#6E6E6E] hover:text-[#4a4a4a]"
          }`}
        >
          {category.name}
        </button>
      ))}
    </div>
  );
};
