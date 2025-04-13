import React from 'react';
import { Recipe } from '@/types/recipe';
import { Product } from '@/data/types';
import { useRecipeDetail } from '@/hooks/useRecipeDetail';
import { useParams } from 'react-router-dom';
import { formatCurrency } from '@/utils/format';
import { Clock, Users, ChefHat, ShoppingCart, Calendar } from 'lucide-react';

interface RecipeDetailProps {
  recipe: Recipe;
  matchedProducts: Product[];
}

export function RecipeDetail() {
  const { id } = useParams<{ id: string }>();
  const { recipe, loading, error, recipeProducts, matchedIngredients } = useRecipeDetail(id);

  if (loading) return <div className="flex justify-center items-center h-64">Loading...</div>;
  if (error) return <div className="text-red-500 p-4">Error: {error}</div>;
  if (!recipe) return <div className="text-gray-500 p-4">Recipe not found</div>;

  const totalOriginalPrice = recipeProducts.reduce((sum, product) => {
    const originalPrice = parseFloat(product.originalPrice.replace(/[^0-9,.]/g, '').replace(',', '.'));
    return sum + (isNaN(originalPrice) ? 0 : originalPrice);
  }, 0);

  const totalCurrentPrice = recipeProducts.reduce((sum, product) => {
    const currentPrice = parseFloat(product.currentPrice.replace(/[^0-9,.]/g, '').replace(',', '.'));
    return sum + (isNaN(currentPrice) ? 0 : currentPrice);
  }, 0);

  const savings = totalOriginalPrice - totalCurrentPrice;
  const savingsPercentage = totalOriginalPrice > 0 ? (savings / totalOriginalPrice) * 100 : 0;

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Recipe Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4">{recipe.title}</h1>
        <div className="flex items-center gap-6 text-gray-600 mb-4">
          <div className="flex items-center">
            <Clock className="w-5 h-5 mr-2" />
            <span>{recipe.time_minutes} minutes</span>
          </div>
          <div className="flex items-center">
            <Users className="w-5 h-5 mr-2" />
            <span>{recipe.servings} servings</span>
          </div>
          <div className="flex items-center">
            <ChefHat className="w-5 h-5 mr-2" />
            <span className="capitalize">{recipe.difficulty}</span>
          </div>
        </div>
        {recipe.image_url && (
          <img 
            src={recipe.image_url} 
            alt={recipe.title} 
            className="w-full h-96 object-cover rounded-lg mb-6"
          />
        )}
      </div>

      {/* Price Summary */}
      {recipeProducts.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Price Summary</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-gray-600">Original Price</p>
              <p className="text-2xl font-bold">{formatCurrency(totalOriginalPrice)}</p>
            </div>
            <div>
              <p className="text-gray-600">Current Price</p>
              <p className="text-2xl font-bold text-green-600">{formatCurrency(totalCurrentPrice)}</p>
            </div>
          </div>
          {savings > 0 && (
            <div className="mt-4 p-4 bg-green-50 rounded-lg">
              <p className="text-green-700 font-semibold">
                Save {formatCurrency(savings)} ({savingsPercentage.toFixed(0)}%)
              </p>
            </div>
          )}
        </div>
      )}

      {/* Ingredients */}
      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Ingredients</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {matchedIngredients.map((ingredient, index) => (
            <div 
              key={index} 
              className={`p-4 rounded-lg ${
                ingredient.matchedProduct?.isDiscounted 
                  ? 'bg-green-50 border border-green-200' 
                  : 'bg-gray-50'
              }`}
            >
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-medium">{ingredient.name}</p>
                  <p className="text-sm text-gray-600">
                    {ingredient.amount} {ingredient.unit}
                    {ingredient.notes && ` (${ingredient.notes})`}
                  </p>
                </div>
                {ingredient.matchedProduct && (
                  <div className="text-right">
                    <p className="font-medium">{ingredient.matchedProduct.name}</p>
                    <p className="text-sm">
                      <span className={ingredient.matchedProduct.isDiscounted ? 'text-green-600' : ''}>
                        {ingredient.matchedProduct.currentPrice}
                      </span>
                      {ingredient.matchedProduct.isDiscounted && (
                        <span className="ml-2 text-gray-500 line-through">
                          {ingredient.matchedProduct.originalPrice}
                        </span>
                      )}
                    </p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Instructions */}
      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Instructions</h2>
        <ol className="list-decimal list-inside space-y-4">
          {recipe.instructions.map((instruction, index) => (
            <li key={index} className="text-gray-700">
              {instruction}
            </li>
          ))}
        </ol>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-4">
        <button
          onClick={() => {/* Add to shopping list handler */}}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          <ShoppingCart className="w-5 h-5" />
          Add to Shopping List
        </button>
        <button
          onClick={() => {/* Add to meal plan handler */}}
          className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
        >
          <Calendar className="w-5 h-5" />
          Add to Meal Plan
        </button>
      </div>
    </div>
  );
} 