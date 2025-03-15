
import React, { useState } from "react";
import { BottomNav } from "@/components/BottomNav";
import { useNavigationState } from "@/hooks/useNavigationState";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import { useRecipes } from "@/hooks/useRecipes";
import { RecipeListHeader } from "@/components/recipes/RecipeListHeader";
import { RecipeList } from "@/components/recipes/RecipeList";

const Recipes = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
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

  const handleRefresh = async () => {
    try {
      setIsRefreshing(true);
      const result = await scrapeRecipes();
      
      if (!result.success) {
        toast({
          title: "Fel vid hämtning av recept",
          description: result.error || "Ett okänt fel inträffade",
          variant: "destructive"
        });
      }
    } catch (err) {
      console.error("Error refreshing recipes:", err);
      toast({
        title: "Fel vid hämtning av recept",
        description: "Kunde inte ansluta till servern. Försök igen senare.",
        variant: "destructive"
      });
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
        onRefresh={handleRefresh}
        isRefreshing={isRefreshing}
        isLoading={loading}
      />

      <div className="px-4 py-4 bg-gray-50">
        <RecipeList
          recipes={recipes}
          loading={loading}
          error={error}
          onRefresh={handleRefresh}
        />
      </div>

      <BottomNav items={navItems} onSelect={handleNavSelect} />
    </div>
  );
};

export default Recipes;
