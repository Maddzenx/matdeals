
import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { BottomNav } from "@/components/BottomNav";
import { useNavigationState } from "@/hooks/useNavigationState";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Clock, Users, ChefHat, RefreshCw } from "lucide-react";
import { useRecipeDetail } from "@/hooks/useRecipeDetail";
import { LoadingIndicator } from "@/components/LoadingIndicator";
import { Separator } from "@/components/ui/separator";
import { toast } from "@/components/ui/use-toast";

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

  // Format price helper
  const formatPrice = (price: number | null) => {
    if (price === null) return "";
    return `${price} kr`;
  };

  // Determine difficulty icon and color
  const getDifficultyProps = (difficulty: string | null) => {
    switch (difficulty?.toLowerCase()) {
      case "lätt":
        return { color: "text-green-600", level: "Lätt" };
      case "avancerad":
        return { color: "text-red-600", level: "Avancerad" };
      default:
        return { color: "text-orange-500", level: "Medel" };
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen pb-20 bg-white">
        <div className="sticky top-0 z-30 bg-white shadow-sm p-4">
          <Button variant="ghost" onClick={handleBack} className="p-0 h-auto">
            <ArrowLeft className="mr-2" size={18} />
            <span>Tillbaka</span>
          </Button>
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
          <Button variant="ghost" onClick={handleBack} className="p-0 h-auto">
            <ArrowLeft className="mr-2" size={18} />
            <span>Tillbaka</span>
          </Button>
        </div>
        <div className="text-center py-8 text-red-500">
          <p>Ett fel inträffade vid laddning av recept.</p>
          <p className="text-sm">{error?.message || "Receptet kunde inte hittas"}</p>
          <Button onClick={handleBack} className="mt-4" variant="destructive">
            Tillbaka till recept
          </Button>
        </div>
        <BottomNav items={navItems} onSelect={handleNavSelect} />
      </div>
    );
  }

  const difficultyProps = getDifficultyProps(recipe.difficulty);

  // Check if detailed ingredients are missing
  const hasDetailedIngredients = recipe.ingredients?.length > 0 && 
                               recipe.ingredients[0]?.includes(' ');
  
  // Check if detailed instructions are missing
  const hasDetailedInstructions = recipe.instructions?.length > 0 && 
                                recipe.instructions[0]?.length > 20;

  return (
    <div className="min-h-screen pb-20 bg-white">
      <div className="sticky top-0 z-30 bg-white shadow-sm p-4 flex items-center justify-between">
        <Button variant="ghost" onClick={handleBack} className="p-0 h-auto">
          <ArrowLeft className="mr-2" size={18} />
          <span>Tillbaka</span>
        </Button>
        {(!hasDetailedIngredients || !hasDetailedInstructions) && (
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleRefresh} 
            className="flex items-center gap-1"
          >
            <RefreshCw size={14} />
            <span>Uppdatera detaljer</span>
          </Button>
        )}
      </div>

      <div className="h-64 bg-gray-200 relative">
        <img 
          src={recipe.image_url || '/placeholder.svg'}
          alt={recipe.title}
          className="w-full h-full object-cover"
          onError={(e) => {
            e.currentTarget.src = '/placeholder.svg';
          }}
        />
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4">
          <h1 className="text-2xl font-bold text-white">{recipe.title}</h1>
        </div>
      </div>

      <div className="p-4">
        <div className="flex gap-2 mb-4 flex-wrap">
          {recipe.tags?.map((tag) => (
            <span 
              key={tag}
              className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-xs font-medium"
            >
              {tag}
            </span>
          ))}
        </div>
        
        <div className="flex justify-between mb-6 text-sm text-gray-500 bg-gray-50 p-3 rounded-lg">
          <div className="flex items-center">
            <Clock size={16} className="mr-1" /> 
            {recipe.time_minutes} min
          </div>
          
          {recipe.servings && (
            <div className="flex items-center">
              <Users size={16} className="mr-1" /> 
              {recipe.servings} pers
            </div>
          )}
          
          <div className={`flex items-center ${difficultyProps.color}`}>
            <ChefHat size={16} className="mr-1" /> 
            {difficultyProps.level}
          </div>
        </div>
        
        {recipe.description && (
          <div className="mb-6">
            <h2 className="text-xl font-bold mb-2">Beskrivning</h2>
            <p className="text-gray-700">
              {recipe.description}
            </p>
          </div>
        )}

        <div className="mb-6">
          <h2 className="text-xl font-bold mb-2">Ingredienser</h2>
          {recipe.servings && (
            <p className="text-gray-500 text-sm mb-3">Ingredienser för {recipe.servings} personer</p>
          )}
          <ul className="space-y-2">
            {recipe.ingredients?.map((ingredient, idx) => (
              <li key={idx} className="flex items-baseline">
                <span className="inline-block w-2 h-2 bg-[#DB2C17] rounded-full mr-2"></span>
                <span className="text-gray-800">{ingredient}</span>
              </li>
            ))}
          </ul>
        </div>

        <Separator className="my-6" />

        <div className="mb-6">
          <h2 className="text-xl font-bold mb-2">Instruktioner</h2>
          <ol className="space-y-4">
            {recipe.instructions?.map((step, idx) => (
              <li key={idx} className="flex">
                <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-[#DB2C17] text-white font-medium text-sm mr-3 flex-shrink-0">
                  {idx + 1}
                </span>
                <span className="text-gray-700">{step}</span>
              </li>
            ))}
          </ol>
        </div>

        {recipe.price && (
          <div className="bg-gray-50 p-4 rounded-lg mt-6 mb-4">
            <div className="flex items-center justify-between">
              <div className="flex flex-col">
                <span className="text-gray-500 text-sm">Uppskattat pris</span>
                <div className="flex items-baseline">
                  {recipe.original_price && (
                    <span className="text-gray-500 line-through text-sm mr-2">
                      {formatPrice(recipe.original_price)}
                    </span>
                  )}
                  <span className="text-[#DB2C17] font-bold text-lg">
                    {formatPrice(recipe.price)}
                  </span>
                </div>
              </div>
              <Button 
                className="bg-[#DB2C17] hover:bg-[#c02615]"
                onClick={handleAddToCart}
              >
                Lägg till handlingslista
              </Button>
            </div>
          </div>
        )}

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
