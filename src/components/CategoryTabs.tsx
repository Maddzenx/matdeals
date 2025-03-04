
import React, { useRef, useEffect } from "react";

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
  const tabsRef = useRef<HTMLDivElement>(null);
  const activeButtonRef = useRef<HTMLButtonElement>(null);

  // Center the active category when it changes
  useEffect(() => {
    if (tabsRef.current && activeButtonRef.current) {
      const container = tabsRef.current;
      const activeButton = activeButtonRef.current;
      
      // Calculate the position to center the active button
      const containerWidth = container.offsetWidth;
      const activeButtonLeft = activeButton.offsetLeft;
      const activeButtonWidth = activeButton.offsetWidth;
      
      // Calculate the scroll position that centers the active button
      const scrollPosition = activeButtonLeft - (containerWidth / 2) + (activeButtonWidth / 2);
      
      // Smooth scroll to the position
      container.scrollTo({
        left: scrollPosition,
        behavior: 'smooth'
      });
    }
  }, [activeCategory]);

  return (
    <div 
      ref={tabsRef}
      className="sticky top-[70px] z-10 bg-white flex overflow-x-auto gap-6 px-4 py-2 border-b-[#EEE] border-b border-solid no-scrollbar mt-3"
    >
      {categories.map((category) => (
        <button
          key={category.id}
          ref={activeCategory === category.id ? activeButtonRef : null}
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
