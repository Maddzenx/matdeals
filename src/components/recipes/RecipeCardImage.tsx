
import React from "react";
import { Badge } from "@/components/ui/badge";
import { ShoppingBag, ChevronUp, ChevronDown } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Recipe } from "@/types/recipe";

interface RecipeCardImageProps {
  recipe: Recipe;
  hasSavings: boolean;
  showProducts: boolean;
  toggleProductsList: (e: React.MouseEvent) => void;
}

export const RecipeCardImage: React.FC<RecipeCardImageProps> = ({
  recipe,
  hasSavings,
  showProducts,
  toggleProductsList,
}) => {
  return (
    <div className="h-48 bg-gray-200 relative">
      {recipe.image_url ? (
        <img 
          src={recipe.image_url}
          alt={recipe.title}
          className="w-full h-full object-cover"
          onError={(e) => {
            e.currentTarget.src = '/placeholder.svg';
          }}
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center text-gray-500">
          Ingen bild tillgänglig
        </div>
      )}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4">
        <h3 className="text-xl font-bold text-white">{recipe.title}</h3>
      </div>
      
      {hasSavings && (
        <div className="absolute top-2 right-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Badge 
                  className="bg-[#DB2C17] hover:bg-[#c02615] flex items-center gap-1 cursor-pointer"
                  onClick={toggleProductsList}
                >
                  <ShoppingBag size={12} />
                  {recipe.matchedProducts?.length} REA
                  {showProducts ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                </Badge>
              </TooltipTrigger>
              <TooltipContent>
                <p>Ingredienser på rea just nu! Klicka för att visa.</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      )}
    </div>
  );
};
