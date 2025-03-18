
import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RecipeOverview } from "@/components/recipe-detail/RecipeOverview";
import { RecipeIngredients } from "@/components/recipe-detail/RecipeIngredients";
import { RecipeInstructions } from "@/components/recipe-detail/RecipeInstructions";
import { RecipePricing } from "@/components/recipe-detail/RecipePricing";
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
    <div className="px-4">
      <Tabs defaultValue="overview" onValueChange={onTabChange} value={activeTab}>
        <TabsList className="grid w-full grid-cols-3 mb-4 touch-feedback">
          <TabsTrigger value="overview" className="py-3">Översikt</TabsTrigger>
          <TabsTrigger value="ingredients" className="py-3">Ingredienser</TabsTrigger>
          <TabsTrigger value="instructions" className="py-3">Tillagning</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="animate-fade-in">
          <RecipeOverview 
            description={recipe.description} 
            source_url={recipe.source_url} 
          />
          {!hidePricing && (
            <RecipePricing 
              price={recipe.price}
              originalPrice={recipe.original_price}
              onAddToCart={onAddToCart} 
              matchedProducts={recipe.matchedProducts}
              savings={recipe.savings}
            />
          )}
          {recipe.matchedProducts && recipe.matchedProducts.length > 0 && (
            <div className="mt-4 mb-6">
              <button
                onClick={onAddToCart}
                className="w-full py-3 px-4 bg-[#DB2C17] text-white rounded-lg font-medium flex items-center justify-center touch-feedback transition-fast"
              >
                Lägg till ingredienser i handlingslistan
              </button>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="ingredients" className="animate-fade-in">
          <RecipeIngredients 
            ingredients={recipe.ingredients} 
            matchedProducts={recipe.matchedProducts}
            servings={recipe.servings}
          />
        </TabsContent>
        
        <TabsContent value="instructions" className="animate-fade-in">
          <RecipeInstructions instructions={recipe.instructions} />
        </TabsContent>
      </Tabs>
    </div>
  );
};
