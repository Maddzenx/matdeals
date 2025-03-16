
import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { BottomNav } from "@/components/BottomNav";
import { useNavigationState } from "@/hooks/useNavigationState";
import { useRecipeDetail } from "@/hooks/useRecipeDetail";
import { RecipeHeader } from "@/components/recipe-detail/RecipeHeader";
import { RecipeOverview } from "@/components/recipe-detail/RecipeOverview";
import { RecipeIngredients } from "@/components/recipe-detail/RecipeIngredients";
import { RecipeInstructions } from "@/components/recipe-detail/RecipeInstructions";
import { RecipePricing } from "@/components/recipe-detail/RecipePricing";
import { LoadingIndicator } from "@/components/LoadingIndicator";
import { Button } from "@/components/ui/button";
import { CalendarDays, ArrowLeft, Loader2 } from "lucide-react";
import { useMealPlan } from "@/hooks/useMealPlan";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/components/ui/use-toast";
import { DaySelector } from "@/components/meal-plan/DaySelector";

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
      <div className="min-h-screen bg-white pb-20 flex flex-col items-center justify-center px-4">
        <h2 className="text-xl font-semibold mb-4">Kunde inte ladda receptet</h2>
        <p className="text-gray-500 mb-6">{error?.message || "Receptet kunde inte hittas."}</p>
        <Button onClick={handleGoBack}>
          <ArrowLeft className="mr-2" size={16} />
          Tillbaka
        </Button>
        <BottomNav items={navItems} onSelect={handleNavSelect} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white pb-20">
      <RecipeHeader 
        title={recipe.title} 
        image={recipe.image_url} 
        onBack={handleGoBack}
        onRefresh={refreshRecipe}
        isRefreshing={isRefreshing}
      />
      
      <div className="px-4 mb-4 flex justify-between">
        <Button 
          variant="outline" 
          size="sm" 
          className="flex items-center gap-1"
          onClick={handleFavoriteToggle}
        >
          <CalendarDays size={16} className={favoriteIds.includes(recipe.id) ? "text-[#DB2C17]" : ""} />
          {favoriteIds.includes(recipe.id) ? "Ta bort favorit" : "Spara som favorit"}
        </Button>
        
        <DaySelector
          mealPlan={mealPlan}
          recipe={recipe}
          onSelectDay={handleAddToMealPlanDay}
          trigger={
            <Button variant="outline" size="sm">
              Lägg till i matsedel
            </Button>
          }
        />
      </div>
      
      <div className="px-4">
        <Tabs defaultValue="overview" onValueChange={setActiveTab} value={activeTab}>
          <TabsList className="grid w-full grid-cols-3 mb-4">
            <TabsTrigger value="overview">Översikt</TabsTrigger>
            <TabsTrigger value="ingredients">Ingredienser</TabsTrigger>
            <TabsTrigger value="instructions">Tillagning</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview">
            <RecipeOverview recipe={recipe} />
            <RecipePricing 
              recipe={recipe} 
              onAddToCart={handleAddIngredientsToCart} 
            />
          </TabsContent>
          
          <TabsContent value="ingredients">
            <RecipeIngredients 
              ingredients={recipe.ingredients} 
              matchedProducts={recipe.matchedProducts}
              servings={recipe.servings}
            />
          </TabsContent>
          
          <TabsContent value="instructions">
            <RecipeInstructions instructions={recipe.instructions} />
          </TabsContent>
        </Tabs>
      </div>
      
      <BottomNav items={navItems} onSelect={handleNavSelect} />
    </div>
  );
};

export default RecipeDetail;
