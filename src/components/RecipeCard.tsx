import React from 'react';
import { Recipe } from '@/types/recipe';
import { Link } from 'react-router-dom';
import { Clock, Users, ChefHat } from 'lucide-react';

interface RecipeCardProps {
  recipe: Recipe;
}

export function RecipeCard({ recipe }: RecipeCardProps) {
  return (
    <Link 
      to={`/recipes/${recipe.id}`}
      className="block bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
    >
      <div className="relative">
        {recipe.image_url && (
          <img 
            src={recipe.image_url} 
            alt={recipe.title} 
            className="w-full h-48 object-cover"
          />
        )}
        {recipe.calculatedPrice && (
          <div className="absolute top-2 right-2 bg-green-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
            {recipe.calculatedPrice.toFixed(2)} kr
          </div>
        )}
      </div>
      
      <div className="p-4">
        <h3 className="text-xl font-semibold mb-2">{recipe.title}</h3>
        
        <div className="flex items-center gap-4 text-gray-600 mb-4">
          <div className="flex items-center">
            <Clock className="w-4 h-4 mr-1" />
            <span>{recipe.time_minutes} min</span>
          </div>
          <div className="flex items-center">
            <Users className="w-4 h-4 mr-1" />
            <span>{recipe.servings} servings</span>
          </div>
          <div className="flex items-center">
            <ChefHat className="w-4 h-4 mr-1" />
            <span className="capitalize">{recipe.difficulty}</span>
          </div>
        </div>

        {recipe.savings && recipe.savings > 0 && (
          <div className="text-green-600 font-semibold mb-2">
            Save {recipe.savings.toFixed(2)} kr
          </div>
        )}
      </div>
    </Link>
  );
} 