
import React from "react";
import { TabsList, TabsTrigger } from "@/components/ui/tabs";

interface RecipeTabListProps {
  activeTab: string;
}

export const RecipeTabList: React.FC<RecipeTabListProps> = ({
  activeTab
}) => {
  return (
    <TabsList className="grid w-full grid-cols-3 mb-4 touch-feedback">
      <TabsTrigger value="overview" className="py-3">Översikt</TabsTrigger>
      <TabsTrigger value="ingredients" className="py-3">Ingredienser</TabsTrigger>
      <TabsTrigger value="instructions" className="py-3">Tillagning</TabsTrigger>
    </TabsList>
  );
};
