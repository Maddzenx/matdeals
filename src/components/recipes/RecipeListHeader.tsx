import React from "react";
import { Separator } from "@/components/ui/separator";
import { RecipeCategoryTabs } from "./RecipeCategoryTabs";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";

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
  onRefresh,
  isRefreshing,
  isLoading
}) => {
  return (
    <div className="sticky top-0 z-30 bg-white shadow-sm">
      <div className="flex items-center justify-between px-4 pt-6 pb-4">
        <h1 className="text-2xl font-bold text-left text-[#1C1C1C]">Upptäck Recept</h1>
        <Button
          variant="ghost"
          size="icon"
          onClick={onRefresh}
          disabled={isRefreshing || isLoading}
          className={`${isRefreshing ? 'animate-spin' : ''}`}
        >
          <RefreshCw className="h-5 w-5" />
        </Button>
      </div>
      
      <RecipeCategoryTabs 
        categories={categories}
        activeCategory={activeCategory}
        onCategoryChange={onCategoryChange}
      />

      {(isRefreshing || isLoading) && (
        <div className="px-4 py-2 bg-blue-50 text-blue-700 text-sm">
          {isRefreshing ? 'Genererar nya recept...' : 'Laddar recept...'}
        </div>
      )}
    </div>
  );
};
