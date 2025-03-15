
import React from "react";

interface RecipeIngredientsProps {
  ingredients: string[] | null;
  servings: number | null;
}

export const RecipeIngredients: React.FC<RecipeIngredientsProps> = ({
  ingredients,
  servings,
}) => {
  if (!ingredients || ingredients.length === 0) {
    return null;
  }

  return (
    <div className="mb-6">
      <h2 className="text-xl font-bold mb-2">Ingredienser</h2>
      {servings && (
        <p className="text-gray-500 text-sm mb-3">Ingredienser för {servings} personer</p>
      )}
      <ul className="space-y-2">
        {ingredients.map((ingredient, idx) => (
          <li key={idx} className="flex items-baseline">
            <span className="inline-block w-2 h-2 bg-[#DB2C17] rounded-full mr-2"></span>
            <span className="text-gray-800">{ingredient}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};
