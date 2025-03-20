
import React from "react";
import { Tabs } from "@/components/ui/tabs";
import { RecipeTabList } from "@/components/recipe-detail/RecipeTabList";
import { RecipeTabContent } from "@/components/recipe-detail/RecipeTabContent";
import { Recipe } from "@/types/recipe";

interface RecipeTabsProps {
  recipe: Recipe;
  activeTab: string;
  onTabChange: (value: string) => void;
  onAddToCart: () => void;
  hidePricing?: boolean;
}

export const RecipeTabs: React.FC<RecipeTabsProps> = ({
  recipe,
  activeTab,
  onTabChange,
  onAddToCart,
  hidePricing = false,
}) => {
  return (
    <div className="px-4 pt-2">
      <Tabs 
        defaultValue="overview" 
        onValueChange={onTabChange} 
        value={activeTab}
        className="w-full"
      >
        <RecipeTabList activeTab={activeTab} />
        <div className="pt-1">
          <RecipeTabContent 
            activeTab={activeTab} 
            recipe={recipe} 
            onAddToCart={onAddToCart} 
            hidePricing={hidePricing} 
          />
        </div>
      </Tabs>
    </div>
  );
};
