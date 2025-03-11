
import { useState } from "react";

export const useViewMode = (initialMode: "grid" | "list" = "grid") => {
  const [viewMode, setViewMode] = useState<"grid" | "list">(initialMode);
  
  const toggleViewMode = () => {
    setViewMode(prev => prev === "grid" ? "list" : "grid");
  };
  
  return { viewMode, toggleViewMode };
};
