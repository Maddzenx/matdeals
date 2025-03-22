
import React from "react";
import { Clock, Users, ChefHat } from "lucide-react";

interface RecipeMetricsProps {
  time_minutes: number | null;
  servings: number | null;
  difficulty: string | null;
  tags?: string[] | null;
}

export const RecipeMetrics: React.FC<RecipeMetricsProps> = ({
  time_minutes,
  servings,
  difficulty,
  tags
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
    <div className="flex justify-between mb-4 text-base bg-gray-50 p-3.5 rounded-lg shadow-sm">
      <div className="flex items-center">
        <Clock size={18} className="mr-2 text-gray-600" /> 
        <span>{time_minutes} min</span>
      </div>
      
      {servings && (
        <div className="flex items-center">
          <Users size={18} className="mr-2 text-gray-600" /> 
          <span>{servings} pers</span>
        </div>
      )}
      
      <div className={`flex items-center ${difficultyProps.color}`}>
        <ChefHat size={18} className="mr-2" /> 
        <span>{difficultyProps.level}</span>
      </div>
    </div>
  );
};
