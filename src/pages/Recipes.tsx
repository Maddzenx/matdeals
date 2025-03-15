
import React, { useState } from "react";
import { BottomNav } from "@/components/BottomNav";
import { useNavigationState } from "@/hooks/useNavigationState";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Clock, Users, ChefHat, RefreshCw } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { useRecipes } from "@/hooks/useRecipes";
import { LoadingIndicator } from "@/components/LoadingIndicator";
import { useToast } from "@/components/ui/use-toast";

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
    if (id === "cart") {
      navigate("/shopping-list");
    } else if (id === "profile") {
      navigate("/auth");
    } else if (id === "offers") {
      navigate("/");
    } else {
      console.log("Selected nav:", id);
    }
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

  return (
    <div className="min-h-screen pb-20 bg-white">
      <link
        rel="stylesheet"
        href="https://cdn.jsdelivr.net/npm/@tabler/icons-webfont@latest/dist/tabler-icons.min.css"
      />
      
      <div className="sticky top-0 z-30 bg-white shadow-sm">
        <div className="flex items-center justify-between px-4 pt-6 pb-4">
          <h1 className="text-2xl font-bold text-left text-[#1C1C1C]">Upptäck Recept</h1>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleRefresh} 
            disabled={isRefreshing || loading}
            className="flex items-center gap-1"
          >
            <RefreshCw size={16} className={isRefreshing ? "animate-spin" : ""} />
            <span className="hidden sm:inline">Uppdatera</span>
          </Button>
        </div>
        
        <div className="px-4 pb-1">
          <div className="flex space-x-6 overflow-x-auto pb-2 no-scrollbar">
            {categories.map((category) => (
              <button
                key={category}
                className={`pb-2 px-1 font-medium text-sm whitespace-nowrap transition-colors ${
                  activeCategory === category 
                    ? "text-[#DB2C17] border-b-2 border-[#DB2C17]" 
                    : "text-gray-500"
                }`}
                onClick={() => changeCategory(category)}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
        <Separator />
      </div>

      <div className="px-4 py-4 bg-gray-50">
        {loading ? (
          <LoadingIndicator message="Laddar recept..." />
        ) : error ? (
          <div className="text-center py-8 text-red-500">
            <p>Ett fel inträffade vid laddning av recept.</p>
            <p className="text-sm">{error.message}</p>
            <Button onClick={handleRefresh} className="mt-4" variant="destructive">
              Försök igen
            </Button>
          </div>
        ) : recipes.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p>Inga recept hittades. Ladda in recept genom att klicka på knappen nedan.</p>
            <Button onClick={handleRefresh} className="mt-4">
              Läs in recept från godare.se
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {recipes.map((recipe) => {
              const difficultyProps = getDifficultyProps(recipe.difficulty);
              
              return (
                <Card 
                  key={recipe.id} 
                  className="overflow-hidden border border-gray-100 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="h-48 bg-gray-200 relative">
                    <img 
                      src={recipe.image_url || '/placeholder.svg'}
                      alt={recipe.title}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.src = '/placeholder.svg';
                      }}
                    />
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4">
                      <h3 className="text-xl font-bold text-white">{recipe.title}</h3>
                    </div>
                  </div>
                  <CardContent className="p-4">
                    <div className="flex gap-2 mb-2 flex-wrap">
                      {recipe.tags?.slice(0, 3).map((tag) => (
                        <span 
                          key={tag}
                          className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-xs font-medium"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                    
                    <div className="flex justify-between mb-4 text-xs text-gray-500">
                      <div className="flex items-center">
                        <Clock size={14} className="mr-1" /> 
                        {recipe.time_minutes} min
                      </div>
                      
                      {recipe.servings && (
                        <div className="flex items-center">
                          <Users size={14} className="mr-1" /> 
                          {recipe.servings} pers
                        </div>
                      )}
                      
                      <div className={`flex items-center ${difficultyProps.color}`}>
                        <ChefHat size={14} className="mr-1" /> 
                        {difficultyProps.level}
                      </div>
                    </div>
                    
                    {recipe.description && (
                      <p className="text-sm text-gray-700 mb-4 line-clamp-2">
                        {recipe.description}
                      </p>
                    )}
                    
                    <div className="flex items-center justify-between">
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
                      <Button className="bg-[#DB2C17] hover:bg-[#c02615]">
                        Lägg till
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      <BottomNav items={navItems} onSelect={handleNavSelect} />
    </div>
  );
};

export default Recipes;
