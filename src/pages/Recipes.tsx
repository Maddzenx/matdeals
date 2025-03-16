
import React, { useState, useEffect } from "react";
import { BottomNav } from "@/components/BottomNav";
import { useNavigationState } from "@/hooks/useNavigationState";
import { useNavigate } from "react-router-dom";
import { useRecipes } from "@/hooks/useRecipes";
import { RecipeListHeader } from "@/components/recipes/RecipeListHeader";
import { RecipeList } from "@/components/recipes/RecipeList";

const Recipes = () => {
  const navigate = useNavigate();
  const { navItems } = useNavigationState();
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  const {
    recipes,
    loading,
    error,
    activeCategory,
    categories,
    changeCategory,
    scrapeRecipes
  } = useRecipes();

  const handleNavSelect = (id: string) => {
    // Navigation logic is now handled in BottomNav component
    console.log("Selected nav:", id);
  };

  // Auto refresh recipes when the page loads
  useEffect(() => {
    const autoRefreshRecipes = async () => {
      try {
        console.log("Auto refreshing recipes on page load...");
        setIsRefreshing(true);
        await scrapeRecipes(false); // Pass false to suppress notifications
      } catch (error) {
        console.error("Error during auto recipe refresh:", error);
      } finally {
        setIsRefreshing(false);
      }
    };
    
    autoRefreshRecipes();
  }, [scrapeRecipes]);

  // Handler for button press - we'll still show notifications when user clicks refresh
  const handleRefreshButton = async () => {
    try {
      setIsRefreshing(true);
      await scrapeRecipes(false); // Don't show notifications
    } catch (err) {
      console.error("Error refreshing recipes:", err);
    } finally {
      setIsRefreshing(false);
    }
  };

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
        onRefresh={handleRefreshButton}
        isRefreshing={isRefreshing}
        isLoading={loading}
      />

      <div className="px-4 py-4 bg-gray-50">
        <RecipeList
          recipes={recipes}
          loading={loading}
          error={error}
          onRefresh={handleRefreshButton}
        />
      </div>

      <BottomNav items={navItems} onSelect={handleNavSelect} />
    </div>
  );
};

export default Recipes;
