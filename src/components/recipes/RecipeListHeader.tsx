
import React from "react";
import { Separator } from "@/components/ui/separator";
import { RecipeCategoryTabs } from "./RecipeCategoryTabs";

interface RecipeListHeaderProps {
  categories: string[];
  activeCategory: string;
  onCategoryChange: (category: string) => void;
  onRefresh: () => void;
  isRefreshing: boolean;
  isLoading: boolean;
}

export const RecipeListHeader: React.FC<RecipeListHeaderProps> = ({
  categories,
  activeCategory,
  onCategoryChange,
  isRefreshing,
  isLoading
}) => {
  return (
    <div className="sticky top-0 z-30 bg-white shadow-sm">
      <div className="flex items-center justify-between px-4 pt-6 pb-4">
        <h1 className="text-2xl font-bold text-left text-[#1C1C1C]">Upptäck Recept</h1>
      </div>
      
      <RecipeCategoryTabs 
        categories={categories}
        activeCategory={activeCategory}
        onCategoryChange={onCategoryChange}
      />
    </div>
  );
};
