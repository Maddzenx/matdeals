
import React, { useRef, useEffect } from "react";
interface Category {
  id: string;
  name: string;
}

// Swedish translations for common category names
const translateCategory = (name: string): string => {
  const translations: Record<string, string> = {
    "All": "Alla",
    "Fruits & Vegetables": "Frukt & Grönt",
    "Meat": "Kött",
    "Fish": "Fisk",
    "Dairy": "Mejeri",
    "Snacks": "Snacks",
    "Bread": "Bröd",
    "Drinks": "Drycker",
    "Other": "Övrigt"
  };
  return translations[name] || name;
};

interface CategoryTabsProps {
  categories: Category[];
  activeCategory: string;
  onSelect: (id: string) => void;
}

export const CategoryTabs: React.FC<CategoryTabsProps> = ({
  categories,
  activeCategory,
  onSelect
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
      const scrollPosition = activeButtonLeft - containerWidth / 2 + activeButtonWidth / 2;

      // Apply the scroll with smooth behavior
      container.scrollTo({
        left: scrollPosition,
        behavior: 'smooth'
      });
    }
  }, [activeCategory]);
  
  return (
    <div 
      className="sticky top-[64px] z-20 bg-white flex overflow-x-auto gap-4 px-4 py-2 no-scrollbar shadow-sm w-full"
      ref={tabsRef}
    >
      {categories.map(category => (
        <button 
          key={category.id} 
          ref={activeCategory === category.id ? activeButtonRef : null} 
          onClick={() => onSelect(category.id)} 
          className={`text-sm font-bold whitespace-nowrap px-2 py-1 transition-all rounded-md ${
            activeCategory === category.id 
              ? "text-[#191919] border-b-2 border-[#191919] bg-neutral-100" 
              : "text-[#6E6E6E] hover:text-[#4a4a4a] hover:bg-neutral-50"
          }`}
        >
          {translateCategory(category.name)}
        </button>
      ))}
    </div>
  );
};
