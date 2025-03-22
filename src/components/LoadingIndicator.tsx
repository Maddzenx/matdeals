
import React from "react";
import { Skeleton } from "@/components/ui/skeleton";

interface LoadingIndicatorProps {
  message?: string;
}

export const LoadingIndicator: React.FC<LoadingIndicatorProps> = ({ 
  message = "Laddar produkter från Supabase..." 
}) => {
  return (
    <div className="p-4 flex flex-col items-center gap-4">
      <p className="text-gray-500">{message}</p>
      <div className="w-full max-w-md space-y-4">
        {/* Product card skeletons */}
        <div className="grid grid-cols-2 gap-2">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="border rounded-md p-3 space-y-2">
              <Skeleton className="h-28 w-full" />
              <Skeleton className="h-5 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-6 w-1/3" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
