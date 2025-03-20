
import React, { useCallback, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
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
import { TopNavigationBar } from "@/components/recipe-detail/TopNavigationBar";
import { useRecipeActions } from "@/hooks/useRecipeActions";

const RecipeDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const { navItems, handleProductQuantityChange } = useNavigationState();
  const { toggleFavorite, favoriteIds, mealPlan, addToMealPlan } = useMealPlan();
  const [activeTab, setActiveTab] = React.useState("overview");
  
  const {
    recipe,
    loading,
    error,
  } = useRecipeDetail(id);

  const { 
    isDropdownOpen, 
    handleDropdownChange,
    handleAddToMealPlanWithToast,
    handleAddToCartWithToast
  } = useRecipeActions();

  // Handle back button click
  const handleGoBack = useCallback(() => {
    navigate(-1);
  }, [navigate]);

  // Handle navigation selection
  const handleNavSelect = useCallback((id: string) => {
    navigate(`/${id}`);
  }, [navigate]);

  // Handle favorite toggle
  const handleFavoriteToggle = useCallback(() => {
    if (recipe) {
      toggleFavorite(recipe.id);
    }
  }, [recipe, toggleFavorite]);

  // Handle add to cart
  const handleAddToCart = useCallback(() => {
    if (recipe) {
      handleAddToCartWithToast(recipe, handleProductQuantityChange);
    }
  }, [recipe, handleAddToCartWithToast, handleProductQuantityChange]);

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
      />
    );
  }

  const hasDiscountedIngredients = recipe.matchedProducts && recipe.matchedProducts.length > 0;

  return (
    <div className="min-h-screen bg-white pb-24 relative">
      <TopNavigationBar
        recipe={recipe}
        favoriteIds={favoriteIds}
        isDropdownOpen={isDropdownOpen}
        onDropdownChange={handleDropdownChange}
        onGoBack={handleGoBack}
        onFavoriteToggle={handleFavoriteToggle}
        onAddToCart={handleAddToCart}
      />

      {/* Add top padding to prevent content from being hidden behind the fixed header */}
      <div className="pt-14">
        <RecipeHeader recipe={recipe} onBack={null} />
        
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
            onAddToMealPlan={(day, recipeId) => handleAddToMealPlanWithToast(day, recipeId, addToMealPlan)}
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
