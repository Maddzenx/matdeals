
import React from "react";
import { TabsList, TabsTrigger } from "@/components/ui/tabs";

interface RecipeTabListProps {
  activeTab: string;
}

export const RecipeTabList: React.FC<RecipeTabListProps> = ({
  activeTab
}) => {
  return (
    <TabsList className="grid w-full grid-cols-3 mb-4 touch-feedback bg-gray-50 p-1 rounded-lg">
      <TabsTrigger 
        value="overview" 
        className="py-3 rounded-md data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:font-medium transition-all"
      >
        Översikt
      </TabsTrigger>
      <TabsTrigger 
        value="ingredients" 
        className="py-3 rounded-md data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:font-medium transition-all"
      >
        Ingredienser
      </TabsTrigger>
      <TabsTrigger 
        value="instructions" 
        className="py-3 rounded-md data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:font-medium transition-all"
      >
        Tillagning
      </TabsTrigger>
    </TabsList>
  );
};
