
import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Recipe } from "@/types/recipe";
import { useNavigate } from "react-router-dom";
import { useNavigationState } from "@/hooks/useNavigationState";
import { useMealPlan } from "@/hooks/useMealPlan";
import { RecipeCardImage } from "./RecipeCardImage";
import { RecipeDiscountedProducts } from "./RecipeDiscountedProducts";
import { RecipeMetadata } from "./RecipeMetadata";
import { RecipeCardActions } from "./RecipeCardActions";

interface RecipeCardProps {
  recipe: Recipe;
  hidePricing?: boolean;
}

export const RecipeCard: React.FC<RecipeCardProps> = ({ 
  recipe,
  hidePricing = true // Set default to true to hide pricing
}) => {
  const navigate = useNavigate();
  const { handleProductQuantityChange } = useNavigationState();
  const { toggleFavorite, favoriteIds } = useMealPlan();
  const [showProducts, setShowProducts] = useState(false);
  
  // Determine if recipe has discounted ingredients
  const hasSavings = recipe.matchedProducts && recipe.matchedProducts.length > 0;
  
  // Check if the recipe is a favorite
  const isFavorite = favoriteIds.includes(recipe.id);
  
  const handleCardClick = () => {
    navigate(`/recipe/${recipe.id}`);
  };
  
  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click when button is clicked
    
    // Add all discounted ingredients to cart
    if (recipe.matchedProducts && recipe.matchedProducts.length > 0) {
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
    }
  };

  // Add to meal plan
  const handleAddToMealPlan = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click
    navigate("/meal-plan");
  };

  // Toggle favorite status
  const handleFavoriteToggle = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click
    toggleFavorite(recipe.id);
  };

  // Toggle showing matched products
  const toggleProductsList = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click
    setShowProducts(!showProducts);
  };
  
  return (
    <Card 
      className="overflow-hidden border border-gray-100 shadow-sm hover:shadow-md transition-shadow cursor-pointer relative touch-feedback"
      onClick={handleCardClick}
    >
      <RecipeCardImage 
        recipe={recipe} 
        hasSavings={hasSavings} 
        showProducts={showProducts} 
        toggleProductsList={toggleProductsList} 
      />

      <CardContent className="p-4">
        <RecipeDiscountedProducts 
          products={recipe.matchedProducts || []} 
          show={showProducts} 
        />

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
        
        <RecipeMetadata recipe={recipe} />
        
        {recipe.description && (
          <p className="text-sm text-gray-700 mb-4 line-clamp-2">
            {recipe.description}
          </p>
        )}
        
        <div className="flex justify-end mt-2">
          <RecipeCardActions 
            isFavorite={isFavorite}
            onFavoriteToggle={handleFavoriteToggle}
            onAddToMealPlan={handleAddToMealPlan}
            onAddToCart={handleAddToCart}
          />
        </div>
      </CardContent>
    </Card>
  );
};
