
import React, { useEffect, useCallback, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Tag, ArrowLeft, Heart, MoreVertical, ChevronRight } from "lucide-react"; // Add the missing imports
import { useNavigationState } from "@/hooks/useNavigationState";
import { useRecipeDetail } from "@/hooks/useRecipeDetail";
import { useMealPlan } from "@/hooks/useMealPlan";
import { RecipeHeader } from "@/components/recipe-detail/RecipeHeader";
import { RecipeMetrics } from "@/components/recipe-detail/RecipeMetrics";
import { RecipeActions } from "@/components/recipe-detail/RecipeActions";
import { RecipeTabs } from "@/components/recipe-detail/RecipeTabs";
import { RecipeError } from "@/components/recipe-detail/RecipeError";
import { LoadingIndicator } from "@/components/LoadingIndicator";
import { BottomNav } from "@/components/BottomNav";
import { useIsMobile } from "@/hooks/use-mobile";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";

const RecipeDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const { navItems, handleProductQuantityChange } = useNavigationState();
  const { toggleFavorite, favoriteIds, mealPlan, addToMealPlan } = useMealPlan();
  const [activeTab, setActiveTab] = useState("overview");
  
  const {
    recipe,
    loading,
    error,
  } = useRecipeDetail(id);

  // Handle back button click
  const handleGoBack = useCallback(() => {
    navigate(-1);
  }, [navigate]);

  // Handle navigation selection
  const handleNavSelect = (id: string) => {
    navigate(`/${id}`);
  };

  // Handle favorite toggle
  const handleFavoriteToggle = useCallback(() => {
    if (recipe) {
      toggleFavorite(recipe.id);
    }
  }, [recipe, toggleFavorite]);

  // Handle adding to meal plan
  const handleAddToMealPlanDay = useCallback((day: string, recipeId: string) => {
    addToMealPlan(day, recipeId);
  }, [addToMealPlan]);

  // Handle add to cart
  const handleAddToCart = useCallback(() => {
    if (recipe && recipe.matchedProducts && recipe.matchedProducts.length > 0) {
      recipe.matchedProducts.forEach((product) => {
        handleProductQuantityChange(
          product.id,
          1,
          0,
          {
            name: product.name,
            details: product.details,
            price: product.currentPrice,
            image: product.image,
            store: product.store,
            recipeId: recipe.id,
            recipeTitle: recipe.title
          }
        );
      });
    }
  }, [recipe, handleProductQuantityChange]);

  // Auto scroll to top on page load
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-white pb-20 flex flex-col items-center justify-center">
        <LoadingIndicator message="Laddar recept..." />
      </div>
    );
  }

  if (error || !recipe) {
    return (
      <RecipeError
        message={error?.message}
        onGoBack={handleGoBack}
        onRetry={() => {}} // Empty function since we removed the retry functionality
      />
    );
  }

  const hasDiscountedIngredients = recipe.matchedProducts && recipe.matchedProducts.length > 0;

  return (
    <div className="min-h-screen bg-white pb-24 relative">
      {/* Top navigation bar - always visible */}
      <div className="fixed top-0 left-0 right-0 bg-white z-50 border-b border-gray-200 shadow-sm">
        <div className="px-4 py-3 flex items-center justify-between">
          <button onClick={handleGoBack} className="text-[#DB2C17]">
            <ArrowLeft size={24} />
          </button>
          
          <h1 className="text-base font-medium truncate max-w-[60%]">
            {recipe.title}
          </h1>
          
          <div className="flex items-center gap-2">
            <button 
              onClick={handleFavoriteToggle}
              className="p-2 rounded-full"
            >
              <Heart 
                size={22} 
                className={favoriteIds.includes(recipe.id) ? "text-[#DB2C17] fill-[#DB2C17]" : "text-gray-600"} 
              />
            </button>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="p-2 rounded-full">
                  <MoreVertical size={22} className="text-gray-600" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem 
                  className="flex items-center cursor-pointer"
                  onClick={() => {
                    // Open meal plan day selector
                    document.getElementById('meal-plan-trigger')?.click();
                  }}
                >
                  <span>Lägg till i matsedel</span>
                  <ChevronRight size={16} className="ml-auto" />
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="cursor-pointer"
                  onClick={handleAddToCart}
                >
                  Lägg till i inköpslista
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      {/* Add top padding to prevent content from being hidden behind the fixed header */}
      <div className="pt-14">
        <RecipeHeader 
          recipe={recipe}
          onBack={null} // Removing the back button from RecipeHeader
        />
        
        <div className="px-4 mt-4">
          <RecipeMetrics 
            time_minutes={recipe.time_minutes}
            servings={recipe.servings}
            difficulty={recipe.difficulty}
          />
          
          <RecipeActions 
            recipe={recipe}
            favoriteIds={favoriteIds}
            mealPlan={mealPlan}
            onFavoriteToggle={handleFavoriteToggle}
            onAddToMealPlan={handleAddToMealPlanDay}
          />
        </div>
        
        <RecipeTabs 
          recipe={recipe}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          onAddToCart={handleAddToCart}
          hidePricing={false}
        />
        
        {hasDiscountedIngredients && activeTab === "ingredients" && (
          <div className="px-4 mb-6 mt-2">
            <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
              <p className="text-sm text-gray-700 flex items-center">
                <Tag size={14} className="mr-2 text-[#DB2C17]" />
                <span>
                  {recipe.matchedProducts?.length} ingrediens{recipe.matchedProducts?.length !== 1 ? 'er' : ''} på REA!
                </span>
              </p>
            </div>
          </div>
        )}
        
        <BottomNav items={navItems} onSelect={handleNavSelect} />
      </div>
    </div>
  );
};

export default RecipeDetail;
