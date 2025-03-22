
import React from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { useIsMobile } from "@/hooks/use-mobile";

interface LoadingIndicatorProps {
  message?: string;
  retry?: () => void;
}

export const LoadingIndicator: React.FC<LoadingIndicatorProps> = ({ 
  message = "Laddar produkter från Supabase...",
  retry
}) => {
  const isMobile = useIsMobile();
  
  return (
    <div className="p-4 flex flex-col items-center gap-4">
      <p className="text-gray-500 text-center">{message}</p>
      <div className="w-full max-w-md space-y-4">
        {/* Product card skeletons */}
        <div className={`grid ${isMobile ? 'grid-cols-2' : 'grid-cols-3'} gap-3`}>
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="border rounded-md p-3 space-y-2">
              <Skeleton className="h-28 w-full" />
              <Skeleton className="h-5 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-6 w-1/3" />
            </div>
          ))}
        </div>
      </div>
      
      {retry && (
        <button 
          onClick={retry}
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
        >
          Försök igen
        </button>
      )}
    </div>
  );
};
