
import React, { useRef, useEffect } from "react";
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
      
      // Apply the scroll with smooth behavior
      container.scrollTo({
        left: scrollPosition,
        behavior: 'smooth'
      });
    }
  }, [activeCategory]);

  return (
    <div className="sticky top-[56px] z-30 bg-white">
      <div className="px-4 pb-1">
        <div 
          ref={tabsRef}
          className="flex space-x-6 overflow-x-auto pb-2 no-scrollbar"
        >
          {categories.map((category) => (
            <button
              key={category}
              ref={activeCategory === category ? activeButtonRef : null}
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
    </div>
  );
};
