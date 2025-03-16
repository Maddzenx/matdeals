import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { BottomNav } from "@/components/BottomNav";
import { RecipeHeader } from "@/components/recipe-detail/RecipeHeader";
import { RecipeIngredients } from "@/components/recipe-detail/RecipeIngredients";
import { RecipeInstructions } from "@/components/recipe-detail/RecipeInstructions";
import { RecipeOverview } from "@/components/recipe-detail/RecipeOverview";
import { RecipePricing } from "@/components/recipe-detail/RecipePricing";
import { RecipeMetrics } from "@/components/recipe-detail/RecipeMetrics";
import { useRecipeDetail } from "@/hooks/useRecipeDetail";
import { useNavigationState } from "@/hooks/useNavigationState";
import { LoadingIndicator } from "@/components/LoadingIndicator";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import { ShoppingCart, ShoppingBag } from "lucide-react";

import { calculateRecipeSavings } from "@/utils/ingredientsMatchUtils";
import { useSupabaseProducts } from "@/hooks/useSupabaseProducts";

const RecipeDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { navItems, handleProductQuantityChange } = useNavigationState();
  const { recipe, loading, error, scrapeRecipe } = useRecipeDetail(id);
  const { products } = useSupabaseProducts();
  
  const handleAddToCart = () => {
    if (!recipe || !recipe.matchedProducts || recipe.matchedProducts.length === 0) {
      toast({
        title: "Inga rabatterade ingredienser",
        description: "Det finns inga rabatterade ingredienser för detta recept just nu.",
      });
      return;
    }
    
    // Add all matched products to cart
    recipe.matchedProducts.forEach(product => {
      handleProductQuantityChange(
        product.id, 
        1, 
        0, 
        {
          name: product.name,
          details: product.details,
          price: product.currentPrice,
          image: product.image,
          store: product.store
        }
      );
    });
    
    toast({
      title: "Ingredienser tillagda",
      description: `${recipe.matchedProducts.length} rabatterade ingredienser tillagda i handlingslistan`,
    });
  };
  
  const handleBackClick = () => {
    navigate(-1);
  };
  
  const handleRefreshRecipe = async () => {
    if (id) {
      await scrapeRecipe(id);
    }
  };
  
  // Calculate price savings based on matching ingredients with products
  const { discountedPrice, originalPrice, savings, matchedProducts } = 
    recipe?.ingredients 
      ? calculateRecipeSavings(recipe.ingredients, products)
      : { discountedPrice: null, originalPrice: null, savings: 0, matchedProducts: [] };
  
  // Use calculated prices if available, otherwise fall back to stored prices
  const finalPrice = discountedPrice || recipe?.price;
  const finalOriginalPrice = originalPrice || recipe?.original_price;

  return (
    <div className="pb-20 min-h-screen bg-white">
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <LoadingIndicator />
        </div>
      ) : error ? (
        <div className="p-4 text-center">
          <h2 className="text-xl font-bold text-red-500">Fel</h2>
          <p className="text-gray-600">Kunde inte ladda receptet.</p>
          <Button 
            variant="outline" 
            onClick={handleBackClick}
            className="mt-4"
          >
            Tillbaka till recept
          </Button>
        </div>
      ) : recipe ? (
        <>
          <RecipeHeader 
            recipe={recipe} 
            onBack={handleBackClick}
            onRefresh={handleRefreshRecipe}
            showRefreshButton={recipe.ingredients === null || recipe.ingredients.length === 0}
          />
          
          <div className="px-4 py-4">
            <RecipeMetrics 
              time_minutes={recipe.time_minutes}
              servings={recipe.servings}
              difficulty={recipe.difficulty}
            />
            
            <RecipeOverview 
              description={recipe.description}
              source_url={recipe.source_url}
            />
            
            <RecipePricing 
              price={finalPrice}
              originalPrice={finalOriginalPrice}
              onAddToCart={handleAddToCart}
              matchedProducts={matchedProducts}
              savings={savings}
            />
            
            {/* Show discounted products if available */}
            {matchedProducts && matchedProducts.length > 0 && (
              <div className="mb-6 p-3 bg-gray-50 rounded-lg border border-gray-200">
                <h3 className="text-lg font-semibold mb-2 flex items-center">
                  <ShoppingBag size={18} className="mr-2 text-[#DB2C17]" />
                  Rabatterade ingredienser
                </h3>
                <ul className="space-y-2">
                  {matchedProducts.map((product, idx) => (
                    <li key={idx} className="flex justify-between items-center py-1 border-b border-gray-100 last:border-0">
                      <div>
                        <p className="font-medium">{product.name}</p>
                        <p className="text-sm text-gray-500">{product.store}</p>
                      </div>
                      <div className="flex items-baseline">
                        {product.originalPrice && (
                          <span className="line-through mr-2 text-gray-500">{product.originalPrice}</span>
                        )}
                        <span className="font-bold text-[#DB2C17]">{product.currentPrice}</span>
                      </div>
                    </li>
                  ))}
                </ul>
                <Button 
                  className="mt-3 w-full bg-[#DB2C17] hover:bg-[#c02615]"
                  onClick={handleAddToCart}
                >
                  <ShoppingCart className="mr-2" size={18} />
                  Lägg till handlingslista
                </Button>
              </div>
            )}
            
            <RecipeIngredients 
              ingredients={recipe.ingredients}
              servings={recipe.servings}
              matchedProducts={matchedProducts}
            />
            
            <RecipeInstructions 
              instructions={recipe.instructions}
            />
          </div>
        </>
      ) : (
        <div className="p-4 text-center">
          <h2 className="text-xl font-bold">Inget recept hittades</h2>
          <Button 
            variant="outline" 
            onClick={handleBackClick}
            className="mt-4"
          >
            Tillbaka till recept
          </Button>
        </div>
      )}
      
      <BottomNav items={navItems} onSelect={() => {}} />
    </div>
  );
};

export default RecipeDetail;
