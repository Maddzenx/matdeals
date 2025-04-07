import React, { useState, useEffect } from "react";
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

  const handleNavSelect = (id: string) => {
    // Navigation logic is now handled in BottomNav component
    console.log("Selected nav:", id);
  };

  const handleGenerateRecipes = async () => {
    try {
      setIsRefreshing(true);
      console.log("Manually generating recipes...");
      await generateAndInsertRecipes();
    } catch (error) {
      console.error("Error generating recipes:", error);
    } finally {
      setIsRefreshing(false);
    }
  };

  // Auto refresh recipes only on first app load
  useEffect(() => {
    if (isFirstLoad) {
      const autoRefreshRecipes = async () => {
        try {
          console.log("Auto refreshing recipes on first app load...");
          setIsRefreshing(true);
          await scrapeRecipes();
          await generateAndInsertRecipes();
        } catch (error) {
          console.error("Error during auto recipe refresh:", error);
        } finally {
          setIsRefreshing(false);
        }
      };
      
      autoRefreshRecipes();
    }
  }, [isFirstLoad, scrapeRecipes, generateAndInsertRecipes]);

  return (
    <div className="min-h-screen pb-20 bg-white">
      <link
        rel="stylesheet"
        href="https://cdn.jsdelivr.net/npm/@tabler/icons-webfont@latest/dist/tabler-icons.min.css"
      />
      
      <RecipeListHeader
        categories={categories}
        activeCategory={activeCategory}
        onCategoryChange={changeCategory}
        onRefresh={handleGenerateRecipes}
        isRefreshing={isRefreshing}
        isLoading={loading}
      />

      <div className="px-4 py-4 bg-gray-50">
        <RecipeList
          recipes={recipes}
          loading={loading}
          error={error}
          onRefresh={handleGenerateRecipes}
        />
      </div>

      <BottomNav items={navItems} onSelect={handleNavSelect} />
    </div>
  );
};

export default Recipes;
