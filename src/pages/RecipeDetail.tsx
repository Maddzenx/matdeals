
import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { BottomNav } from "@/components/BottomNav";
import { useNavigationState } from "@/hooks/useNavigationState";
import { useRecipeDetail } from "@/hooks/useRecipeDetail";
import { RecipeHeader } from "@/components/recipe-detail/RecipeHeader";
import { LoadingIndicator } from "@/components/LoadingIndicator";
import { useMealPlan } from "@/hooks/useMealPlan";
import { toast } from "@/components/ui/use-toast";
import { RecipeActions } from "@/components/recipe-detail/RecipeActions";
import { RecipeTabs } from "@/components/recipe-detail/RecipeTabs";
import { RecipeError } from "@/components/recipe-detail/RecipeError";

const RecipeDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { navItems, handleProductQuantityChange } = useNavigationState();
  const { recipe, loading, error, scrapeRecipe } = useRecipeDetail(id);
  const [activeTab, setActiveTab] = useState("overview");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { toggleFavorite, favoriteIds, mealPlan, addToMealPlan } = useMealPlan();

  const handleNavSelect = (id: string) => {
    console.log("Selected nav:", id);
  };

  const handleGoBack = () => {
    navigate(-1);
  };

  const refreshRecipe = async () => {
    if (!id || isRefreshing) return;
    
    setIsRefreshing(true);
    await scrapeRecipe(id);
    setIsRefreshing(false);
    
    toast({
      title: "Uppdaterat",
      description: "Receptet har uppdaterats med den senaste informationen.",
    });
  };

  // Add to shopping cart functionality
  const handleAddIngredientsToCart = () => {
    if (!recipe?.matchedProducts || recipe.matchedProducts.length === 0) {
      toast({
        title: "Inga rabatterade varor",
        description: "Det finns inga rabatterade ingredienser att lägga till.",
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
      title: "Tillagt i varukorgen",
      description: `${recipe.matchedProducts.length} rabatterade varor har lagts till i varukorgen.`,
    });
  };

  const handleFavoriteToggle = () => {
    if (!recipe) return;
    toggleFavorite(recipe.id);
    
    const isFavorite = favoriteIds.includes(recipe.id);
    toast({
      title: isFavorite ? "Borttagen från favoriter" : "Tillagd som favorit",
      description: isFavorite 
        ? "Receptet har tagits bort från dina favoriter." 
        : "Receptet har lagts till bland dina favoriter.",
    });
  };

  const handleAddToMealPlanDay = (day: string, recipeId: string) => {
    addToMealPlan(day, recipeId);
    
    toast({
      title: "Tillagt i matsedeln",
      description: "Receptet har lagts till i din matsedel.",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white pb-20">
        <LoadingIndicator message="Laddar recept..." />
        <BottomNav items={navItems} onSelect={handleNavSelect} />
      </div>
    );
  }

  if (error || !recipe) {
    return (
      <>
        <RecipeError message={error?.message} onGoBack={handleGoBack} />
        <BottomNav items={navItems} onSelect={handleNavSelect} />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-white pb-20">
      <RecipeHeader 
        recipe={recipe}
        onBack={handleGoBack}
        onRefresh={refreshRecipe}
        showRefreshButton={true}
      />
      
      <RecipeActions 
        recipe={recipe}
        favoriteIds={favoriteIds}
        mealPlan={mealPlan}
        onFavoriteToggle={handleFavoriteToggle}
        onAddToMealPlan={handleAddToMealPlan}
      />
      
      <RecipeTabs
        recipe={recipe}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onAddToCart={handleAddIngredientsToCart}
      />
      
      <BottomNav items={navItems} onSelect={handleNavSelect} />
    </div>
  );
};

export default RecipeDetail;
