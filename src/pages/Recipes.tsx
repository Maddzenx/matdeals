import React, { useState, useEffect, useCallback } from "react";
import { BottomNav } from "@/components/BottomNav";
import { useNavigationState } from "@/hooks/useNavigationState";
import { useNavigate } from "react-router-dom";
import { useRecipes } from "@/hooks/useRecipes";
import { RecipeListHeader } from "@/components/recipes/RecipeListHeader";
import { RecipeList } from "@/components/recipes/RecipeList";
import { useMealPlan } from "@/hooks/useMealPlan";
import { useAppSession } from "@/hooks/useAppSession";

const Recipes = () => {
  const navigate = useNavigate();
  const { navItems } = useNavigationState();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { isFirstLoad } = useAppSession();
  
  const {
    recipes,
    loading,
    error,
    activeCategory,
    categories,
    changeCategory,
    scrapeRecipes,
    generateAndInsertRecipes
  } = useRecipes();

  // Load meal plan hook to make it available for recipe cards
  useMealPlan();

  const handleNavSelect = useCallback((id: string) => {
    // Navigation logic is now handled in BottomNav component
    console.log("Selected nav:", id);
  }, []);

  const handleGenerateRecipes = useCallback(async () => {
    try {
      setIsRefreshing(true);
      console.log("Manually generating recipes...");
      await generateAndInsertRecipes();
    } catch (error) {
      console.error("Error generating recipes:", error);
    } finally {
      setIsRefreshing(false);
    }
  }, [generateAndInsertRecipes]);

  // Auto refresh recipes only on first app load
  useEffect(() => {
    if (isFirstLoad) {
      const autoRefreshRecipes = async () => {
        try {
          console.log("Auto refreshing recipes on first app load...");
          setIsRefreshing(true);
          await scrapeRecipes();
        } catch (error) {
          console.error("Error during auto recipe refresh:", error);
        } finally {
          setIsRefreshing(false);
        }
      };
      
      autoRefreshRecipes();
    }
  }, [isFirstLoad, scrapeRecipes]);

  return (
    <div className="flex flex-col min-h-screen">
      <RecipeListHeader
        activeCategory={activeCategory}
        categories={categories}
        onCategoryChange={changeCategory}
        onRefresh={handleGenerateRecipes}
        isRefreshing={isRefreshing}
        isLoading={loading}
      />
      <RecipeList
        recipes={recipes}
        loading={loading}
        error={error}
        onRefresh={handleGenerateRecipes}
      />
      <BottomNav items={navItems} onSelect={handleNavSelect} />
    </div>
  );
};

export default Recipes;
