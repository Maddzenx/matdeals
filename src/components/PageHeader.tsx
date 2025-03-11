
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
  return (
    <div className="flex items-center justify-between px-4 pt-3 pb-1">
      <h1 className="text-2xl font-bold text-[#1C1C1C]">{title}</h1>
      <div className="flex items-center gap-2">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={onRefresh} 
          disabled={isRefreshing}
          className="flex items-center gap-1"
        >
          <RefreshCw size={16} className={isRefreshing ? "animate-spin" : ""} />
          <span className="hidden sm:inline">Uppdatera ICA</span>
        </Button>
        <button 
          onClick={onToggleViewMode}
          className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
          aria-label={viewMode === "grid" ? "Switch to list view" : "Switch to grid view"}
        >
          {viewMode === "grid" ? <List size={20} /> : <Grid2X2 size={20} />}
        </button>
      </div>
    </div>
  );
};
