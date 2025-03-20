
import React from "react";
import { ArrowLeft, Heart, MoreVertical, ChevronRight } from "lucide-react";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Recipe } from "@/types/recipe";

interface TopNavigationBarProps {
  recipe: Recipe;
  favoriteIds: string[];
  isDropdownOpen: boolean;
  onDropdownChange: (open: boolean) => void;
  onGoBack: () => void;
  onFavoriteToggle: () => void;
  onAddToCart: () => void;
}

export const TopNavigationBar: React.FC<TopNavigationBarProps> = ({
  recipe,
  favoriteIds,
  isDropdownOpen,
  onDropdownChange,
  onGoBack,
  onFavoriteToggle,
  onAddToCart,
}) => {
  return (
    <div className="fixed top-0 left-0 right-0 bg-white z-50 border-b border-gray-200 shadow-sm">
      <div className="px-4 py-3 flex items-center justify-between">
        <button onClick={onGoBack} className="text-[#DB2C17]">
          <ArrowLeft size={24} />
        </button>
        
        <h1 className="text-base font-medium truncate max-w-[60%]">
          {recipe.title}
        </h1>
        
        <div className="flex items-center gap-2">
          <button 
            onClick={onFavoriteToggle}
            className="p-2 rounded-full"
          >
            <Heart 
              size={22} 
              className={favoriteIds.includes(recipe.id) ? "text-[#DB2C17] fill-[#DB2C17]" : "text-gray-600"} 
            />
          </button>
          
          <DropdownMenu open={isDropdownOpen} onOpenChange={onDropdownChange}>
            <DropdownMenuTrigger asChild>
              <button className="p-2 rounded-full">
                <MoreVertical size={22} className="text-gray-600" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 z-[100] bg-white">
              <DropdownMenuItem 
                className="flex items-center cursor-pointer"
                onSelect={(e) => {
                  e.preventDefault();
                  document.getElementById('meal-plan-trigger')?.click();
                }}
              >
                <span>Lägg till i matsedel</span>
                <ChevronRight size={16} className="ml-auto" />
              </DropdownMenuItem>
              <DropdownMenuItem
                className="cursor-pointer"
                onSelect={(e) => {
                  e.preventDefault();
                  onAddToCart();
                }}
              >
                Lägg till i inköpslista
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
};
