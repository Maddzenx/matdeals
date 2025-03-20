
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
import { Button } from "@/components/ui/button";

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
          <div className="fixed inset-0 bg-black/50 z-[999]" onClick={() => setShowMealPlanSelector(false)}>
            <div className="fixed bottom-0 left-0 right-0 bg-white rounded-t-xl z-[1000]" 
                 onClick={(e) => e.stopPropagation()}>
              <div className="p-4">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold">Välj dag för receptet</h3>
                </div>
                <div className="grid gap-3 py-2">
                  {mealPlan.map((day) => (
                    <Button
                      key={day.day}
                      variant={day.day === day.day ? "default" : "outline"}
                      className="w-full justify-between"
                      onClick={() => {
                        handleAddToMealPlanWithToast(day.day, recipe.id, addToMealPlan);
                        setShowMealPlanSelector(false);
                      }}
                    >
                      <span>{day.day}</span>
                      {day.recipe && (
                        <span className="text-xs">(upptagen)</span>
                      )}
                    </Button>
                  ))}
                </div>
                <div className="mt-6 flex justify-end gap-3">
                  <Button variant="outline" onClick={() => setShowMealPlanSelector(false)}>
                    Avbryt
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
        
        <BottomNav items={navItems} onSelect={handleNavSelect} />
      </div>
    </div>
  );
};

export default RecipeDetail;
