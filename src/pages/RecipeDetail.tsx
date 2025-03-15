
import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { BottomNav } from "@/components/BottomNav";
import { useNavigationState } from "@/hooks/useNavigationState";
import { useRecipeDetail } from "@/hooks/useRecipeDetail";
import { LoadingIndicator } from "@/components/LoadingIndicator";
import { Separator } from "@/components/ui/separator";
import { toast } from "@/components/ui/use-toast";

// Import our new components
import { RecipeHeader } from "@/components/recipe-detail/RecipeHeader";
import { RecipeMetrics } from "@/components/recipe-detail/RecipeMetrics";
import { RecipeOverview } from "@/components/recipe-detail/RecipeOverview";
import { RecipeIngredients } from "@/components/recipe-detail/RecipeIngredients";
import { RecipeInstructions } from "@/components/recipe-detail/RecipeInstructions";
import { RecipePricing } from "@/components/recipe-detail/RecipePricing";

const RecipeDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { navItems } = useNavigationState();
  const { recipe, loading, error, scrapeRecipe } = useRecipeDetail(id);

  const handleNavSelect = (id: string) => {
    if (id === "cart") {
      navigate("/shopping-list");
    } else if (id === "profile") {
      navigate("/auth");
    } else if (id === "offers") {
      navigate("/");
    } else if (id === "recipes") {
      navigate("/recipes");
    }
  };

  const handleBack = () => {
    navigate("/recipes");
  };

  const handleAddToCart = () => {
    // Future functionality: Add all ingredients to cart
    toast({
      title: "Lagt till i handlingslistan",
      description: "Alla ingredienser har lagts till i din handlingslista",
    });
  };

  const handleRefresh = () => {
    if (id) {
      scrapeRecipe(id);
    }
  };

  // Check if detailed ingredients and instructions are missing
  const shouldShowRefreshButton = (recipe) => {
    if (!recipe) return false;
    
    const hasDetailedIngredients = recipe.ingredients?.length > 0 && 
                                 recipe.ingredients[0]?.includes(' ');
    
    const hasDetailedInstructions = recipe.instructions?.length > 0 && 
                                  recipe.instructions[0]?.length > 20;
                                  
    return !hasDetailedIngredients || !hasDetailedInstructions;
  };

  if (loading) {
    return (
      <div className="min-h-screen pb-20 bg-white">
        <div className="sticky top-0 z-30 bg-white shadow-sm p-4">
          <button onClick={handleBack} className="flex items-center text-gray-600">
            <span>Tillbaka</span>
          </button>
        </div>
        <LoadingIndicator message="Laddar recept..." />
        <BottomNav items={navItems} onSelect={handleNavSelect} />
      </div>
    );
  }

  if (error || !recipe) {
    return (
      <div className="min-h-screen pb-20 bg-white">
        <div className="sticky top-0 z-30 bg-white shadow-sm p-4">
          <button onClick={handleBack} className="flex items-center text-gray-600">
            <span>Tillbaka</span>
          </button>
        </div>
        <div className="text-center py-8 text-red-500">
          <p>Ett fel inträffade vid laddning av recept.</p>
          <p className="text-sm">{error?.message || "Receptet kunde inte hittas"}</p>
        </div>
        <BottomNav items={navItems} onSelect={handleNavSelect} />
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-20 bg-white">
      <RecipeHeader 
        recipe={recipe} 
        onBack={handleBack} 
        onRefresh={handleRefresh}
        showRefreshButton={shouldShowRefreshButton(recipe)}
      />

      <div className="p-4">
        <RecipeOverview 
          tags={recipe.tags} 
          description={recipe.description} 
        />
        
        <RecipeMetrics 
          timeMinutes={recipe.time_minutes} 
          servings={recipe.servings} 
          difficulty={recipe.difficulty} 
        />

        <RecipeIngredients 
          ingredients={recipe.ingredients} 
          servings={recipe.servings} 
        />

        <Separator className="my-6" />

        <RecipeInstructions 
          instructions={recipe.instructions} 
        />

        <RecipePricing 
          price={recipe.price} 
          originalPrice={recipe.original_price}
          onAddToCart={handleAddToCart}
        />

        {recipe.source_url && (
          <div className="mt-6 text-sm text-gray-500">
            <p>Källa: <a href={recipe.source_url} target="_blank" rel="noopener noreferrer" className="underline">{recipe.source_url}</a></p>
          </div>
        )}
      </div>

      <BottomNav items={navItems} onSelect={handleNavSelect} />
    </div>
  );
};

export default RecipeDetail;
