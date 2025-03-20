
import React from "react";
import { TabsContent } from "@/components/ui/tabs";
import { RecipeOverview } from "@/components/recipe-detail/RecipeOverview";
import { RecipeIngredients } from "@/components/recipe-detail/RecipeIngredients";
import { RecipeInstructions } from "@/components/recipe-detail/RecipeInstructions";
import { RecipePricing } from "@/components/recipe-detail/RecipePricing";
import { Recipe } from "@/types/recipe";

interface RecipeTabContentProps {
  activeTab: string;
  recipe: Recipe;
  onAddToCart: () => void;
  hidePricing?: boolean;
}

export const RecipeTabContent: React.FC<RecipeTabContentProps> = ({
  activeTab,
  recipe,
  onAddToCart,
  hidePricing = false
}) => {
  return (
    <>
      <TabsContent value="overview" className="animate-fade-in mt-0">
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
              onClick={(e) => {
                if (e) {
                  e.stopPropagation();
                }
                onAddToCart();
              }}
              className="w-full py-3 px-4 bg-[#DB2C17] text-white rounded-lg font-medium flex items-center justify-center touch-feedback transition-fast"
            >
              Lägg till ingredienser i handlingslistan
            </button>
          </div>
        )}
      </TabsContent>
      
      <TabsContent value="ingredients" className="animate-fade-in mt-0">
        <RecipeIngredients 
          ingredients={recipe.ingredients} 
          matchedProducts={recipe.matchedProducts}
          servings={recipe.servings}
        />
      </TabsContent>
      
      <TabsContent value="instructions" className="animate-fade-in mt-0">
        <RecipeInstructions instructions={recipe.instructions} />
      </TabsContent>
    </>
  );
};
