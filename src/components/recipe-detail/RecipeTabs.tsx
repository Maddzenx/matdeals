
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
}

export const RecipeTabs: React.FC<RecipeTabsProps> = ({
  recipe,
  activeTab,
  onTabChange,
  onAddToCart,
}) => {
  return (
    <div className="px-4">
      <Tabs defaultValue="overview" onValueChange={onTabChange} value={activeTab}>
        <TabsList className="grid w-full grid-cols-3 mb-4">
          <TabsTrigger value="overview">Översikt</TabsTrigger>
          <TabsTrigger value="ingredients">Ingredienser</TabsTrigger>
          <TabsTrigger value="instructions">Tillagning</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview">
          <RecipeOverview 
            description={recipe.description} 
            source_url={recipe.source_url} 
          />
          <RecipePricing 
            price={recipe.price}
            originalPrice={recipe.original_price}
            onAddToCart={onAddToCart} 
            matchedProducts={recipe.matchedProducts}
            savings={recipe.savings}
          />
        </TabsContent>
        
        <TabsContent value="ingredients">
          <RecipeIngredients 
            ingredients={recipe.ingredients} 
            matchedProducts={recipe.matchedProducts}
            servings={recipe.servings}
          />
        </TabsContent>
        
        <TabsContent value="instructions">
          <RecipeInstructions instructions={recipe.instructions} />
        </TabsContent>
      </Tabs>
    </div>
  );
};
