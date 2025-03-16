
import React from "react";

interface RecipeOverviewProps {
  description: string | null;
  source_url?: string | null;
}

export const RecipeOverview: React.FC<RecipeOverviewProps> = ({
  description,
  source_url,
}) => {
  return (
    <>
      {description && (
        <div className="mb-6">
          <h2 className="text-xl font-bold mb-2">Beskrivning</h2>
          <p className="text-gray-700">
            {description}
          </p>
          
          {source_url && (
            <div className="mt-2">
              <a 
                href={source_url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline text-sm"
              >
                Se originalkälla
              </a>
            </div>
          )}
        </div>
      )}
    </>
  );
};
