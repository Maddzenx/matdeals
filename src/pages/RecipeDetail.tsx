
import React, { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useNavigationState } from "@/hooks/useNavigationState";
import { useRecipeDetail } from "@/hooks/useRecipeDetail";
import { useMealPlan } from "@/hooks/useMealPlan";
import { RecipeHeader } from "@/components/recipe-detail/RecipeHeader";
import { RecipeMetrics } from "@/components/recipe-detail/RecipeMetrics";
import { RecipeTabs } from "@/components/recipe-detail/RecipeTabs";
import { RecipeError } from "@/components/recipe-detail/RecipeError";
import { LoadingIndicator } from "@/components/LoadingIndicator";
import { BottomNav } from "@/components/BottomNav";
import { useIsMobile } from "@/hooks/use-mobile";
import { TopNavigationBar } from "@/components/recipe-detail/TopNavigationBar";
import { useRecipeActions } from "@/hooks/useRecipeActions";
import { Tag } from "lucide-react";
import { DaySelector } from "@/components/meal-plan/DaySelector";

const RecipeDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const { navItems, handleProductQuantityChange } = useNavigationState();
  const { toggleFavorite, favoriteIds, mealPlan, addToMealPlan } = useMealPlan();
  const [activeTab, setActiveTab] = React.useState("overview");
  const [showMealPlanSelector, setShowMealPlanSelector] = useState(false);
  
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

  const handleGoBack = useCallback(() => {
    navigate(-1);
  }, [navigate]);

  const handleNavSelect = useCallback((id: string) => {
    navigate(`/${id}`);
  }, [navigate]);

  const handleFavoriteToggle = useCallback(() => {
    if (recipe) {
      toggleFavorite(recipe.id);
    }
  }, [recipe, toggleFavorite]);

  const handleAddToCart = useCallback(() => {
    if (recipe) {
      handleAddToCartWithToast(recipe, handleProductQuantityChange);
    }
  }, [recipe, handleAddToCartWithToast, handleProductQuantityChange]);

  const handleAddToMealPlanClick = useCallback(() => {
    setShowMealPlanSelector(true);
  }, []);

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
        onAddToMealPlanClick={handleAddToMealPlanClick}
      />

      <div className="pt-14">
        <RecipeHeader recipe={recipe} onBack={null} />
        
        <div className="px-4 mt-4">
          <RecipeMetrics 
            time_minutes={recipe.time_minutes}
            servings={recipe.servings}
            difficulty={recipe.difficulty}
          />
          
          {/* RecipeActions component has been removed */}
        </div>
        
        <div className="mt-4">
          <RecipeTabs 
            recipe={recipe}
            activeTab={activeTab}
            onTabChange={setActiveTab}
            onAddToCart={handleAddToCart}
            hidePricing={false}
          />
        </div>
        
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
        
        {showMealPlanSelector && (
          <DaySelector
            mealPlan={mealPlan}
            recipe={recipe}
            onSelectDay={(day, recipeId) => {
              handleAddToMealPlanWithToast(day, recipeId, addToMealPlan);
              setShowMealPlanSelector(false);
            }}
            trigger={null}
          />
        )}
        
        <BottomNav items={navItems} onSelect={handleNavSelect} />
      </div>
    </div>
  );
};

export default RecipeDetail;
