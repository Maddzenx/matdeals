
import React from "react";

interface RecipeInstructionsProps {
  instructions: string[] | null;
}

export const RecipeInstructions: React.FC<RecipeInstructionsProps> = ({
  instructions,
}) => {
  if (!instructions || instructions.length === 0) {
    return null;
  }

  return (
    <div className="mb-6">
      <h2 className="text-xl font-bold mb-2">Instruktioner</h2>
      <ol className="space-y-4">
        {instructions.map((step, idx) => (
          <li key={idx} className="flex">
            <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-[#DB2C17] text-white font-medium text-sm mr-3 flex-shrink-0">
              {idx + 1}
            </span>
            <span className="text-gray-700">{step}</span>
          </li>
        ))}
      </ol>
    </div>
  );
};
