
import React from "react";
import { ArrowLeft, Heart, MoreVertical, CalendarDays, ShoppingCart } from "lucide-react";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
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
  onAddToMealPlanClick: () => void;
}

export const TopNavigationBar: React.FC<TopNavigationBarProps> = ({
  recipe,
  favoriteIds,
  isDropdownOpen,
  onDropdownChange,
  onGoBack,
  onFavoriteToggle,
  onAddToCart,
  onAddToMealPlanClick,
}) => {
  return (
    <div className="fixed top-0 left-0 right-0 bg-white z-50 border-b border-gray-200 shadow-sm">
      <div className="px-4 py-4 flex items-center justify-between">
        <button onClick={onGoBack} className="text-[#DB2C17] p-2.5">
          <ArrowLeft size={28} />
        </button>
        
        <h1 className="text-xl font-medium truncate max-w-[60%]">
          {recipe.title}
        </h1>
        
        <div className="flex items-center gap-2">
          <button 
            onClick={onFavoriteToggle}
            className="p-3 rounded-full"
          >
            <Heart 
              size={26} 
              className={favoriteIds.includes(recipe.id) ? "text-[#DB2C17] fill-[#DB2C17]" : "text-gray-600"} 
            />
          </button>
          
          <DropdownMenu open={isDropdownOpen} onOpenChange={onDropdownChange}>
            <DropdownMenuTrigger asChild>
              <button className="p-3 rounded-full">
                <MoreVertical size={26} className="text-gray-600" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 z-[60] bg-white">
              <DropdownMenuItem 
                className="flex items-center cursor-pointer py-3.5 text-lg"
                onClick={(e) => {
                  e.stopPropagation();
                  onAddToMealPlanClick();
                }}
              >
                <CalendarDays size={20} className="mr-2" />
                <span>Lägg till i matsedel</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="flex items-center cursor-pointer py-3.5 text-lg"
                onClick={(e) => {
                  e.stopPropagation();
                  onAddToCart();
                }}
              >
                <ShoppingCart size={20} className="mr-2" />
                <span>Lägg till i inköpslista</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
};
