
import React from "react";

interface RecipeOverviewProps {
  tags: string[] | null;
  description: string | null;
}

export const RecipeOverview: React.FC<RecipeOverviewProps> = ({
  tags,
  description,
}) => {
  return (
    <>
      {tags && tags.length > 0 && (
        <div className="flex gap-2 mb-4 flex-wrap">
          {tags.map((tag) => (
            <span 
              key={tag}
              className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-xs font-medium"
            >
              {tag}
            </span>
          ))}
        </div>
      )}
      
      {description && (
        <div className="mb-6">
          <h2 className="text-xl font-bold mb-2">Beskrivning</h2>
          <p className="text-gray-700">
            {description}
          </p>
        </div>
      )}
    </>
  );
};
