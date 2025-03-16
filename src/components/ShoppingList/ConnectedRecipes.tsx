
import React from "react";
import { CartItem } from "@/hooks/useCartState";
import { Button } from "@/components/ui/button";
import { ChefHat, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface ConnectedRecipesProps {
  cartItems: CartItem[];
}

export const ConnectedRecipes: React.FC<ConnectedRecipesProps> = ({ cartItems }) => {
  const navigate = useNavigate();
  
  // Get unique recipes from cart items
  const recipes = React.useMemo(() => {
    const recipeMap = new Map<string, { id: string, title: string, count: number }>();
    
    cartItems.forEach(item => {
      if (item.recipeId && item.recipeTitle) {
        if (recipeMap.has(item.recipeId)) {
          const recipe = recipeMap.get(item.recipeId)!;
          recipeMap.set(item.recipeId, { ...recipe, count: recipe.count + 1 });
        } else {
          recipeMap.set(item.recipeId, { id: item.recipeId, title: item.recipeTitle, count: 1 });
        }
      }
    });
    
    return Array.from(recipeMap.values());
  }, [cartItems]);
  
  if (recipes.length === 0) {
    return null;
  }
  
  const handleNavigateToRecipe = (recipeId: string) => {
    navigate(`/recipe/${recipeId}`);
  };
  
  return (
    <div className="mt-8 border-t border-gray-200 pt-4">
      <h2 className="text-base font-semibold text-[#1C1C1C] flex items-center gap-2 mb-3">
        <ChefHat size={18} className="text-gray-600" />
        Recept i din handlingslista
      </h2>
      
      <div className="space-y-3">
        {recipes.map((recipe) => (
          <div 
            key={recipe.id}
            className="bg-gray-50 rounded-lg p-3 flex justify-between items-center"
          >
            <div className="flex-1">
              <p className="font-medium">{recipe.title}</p>
              <p className="text-xs text-gray-500">{recipe.count} {recipe.count === 1 ? 'ingrediens' : 'ingredienser'}</p>
            </div>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => handleNavigateToRecipe(recipe.id)}
              className="text-[#DB2C17]"
            >
              <span className="mr-1">Se recept</span>
              <ArrowRight size={16} />
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
};
