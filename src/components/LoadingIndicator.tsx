
import React from "react";

interface LoadingIndicatorProps {
  message?: string;
}

export const LoadingIndicator: React.FC<LoadingIndicatorProps> = ({ 
  message = "Laddar produkter från Supabase..." 
}) => {
  return (
    <div className="p-4 flex justify-center">
      <p className="text-gray-500">{message}</p>
    </div>
  );
};
