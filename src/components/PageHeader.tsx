import React from "react";
import { Grid2X2, List, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PageHeaderProps {
  title: string;
  onRefresh: () => void;
  isRefreshing: boolean;
  viewMode: "grid" | "list";
  onToggleViewMode: () => void;
}

export const PageHeader: React.FC<PageHeaderProps> = ({ 
  title, 
  onRefresh, 
  isRefreshing, 
  viewMode, 
  onToggleViewMode 
}) => {
  // We're keeping the onRefresh and isRefreshing props to not break the interface,
  // but we're not using them in the UI anymore as requested
  
  // Fire onRefresh in the background when component mounts
  React.useEffect(() => {
    // Use a small timeout to not impact initial rendering
    const timer = setTimeout(() => {
      onRefresh();
    }, 1000);
    
    return () => clearTimeout(timer);
  }, [onRefresh]);

  return (
    <div className="flex items-center justify-between px-4 pt-3 pb-1">
      <h1 className="text-2xl font-bold text-[#1C1C1C]">{title}</h1>
      <div className="flex items-center gap-2">
        <button 
          onClick={onToggleViewMode}
          className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
          aria-label={viewMode === "grid" ? "Byt till listvy" : "Byt till rutnätsvy"}
        >
          {viewMode === "grid" ? <List size={20} /> : <Grid2X2 size={20} />}
        </button>
      </div>
    </div>
  );
};
