
import React from "react";
import { Clock, Users, ChefHat } from "lucide-react";

interface RecipeMetricsProps {
  time_minutes: number | null;
  servings: number | null;
  difficulty: string | null;
}

export const RecipeMetrics: React.FC<RecipeMetricsProps> = ({
  time_minutes,
  servings,
  difficulty,
}) => {
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

  const difficultyProps = getDifficultyProps(difficulty);

  return (
    <div className="flex justify-between mb-6 text-sm text-gray-500 bg-gray-50 p-3 rounded-lg">
      <div className="flex items-center">
        <Clock size={16} className="mr-1" /> 
        {time_minutes} min
      </div>
      
      {servings && (
        <div className="flex items-center">
          <Users size={16} className="mr-1" /> 
          {servings} pers
        </div>
      )}
      
      <div className={`flex items-center ${difficultyProps.color}`}>
        <ChefHat size={16} className="mr-1" /> 
        {difficultyProps.level}
      </div>
    </div>
  );
};
