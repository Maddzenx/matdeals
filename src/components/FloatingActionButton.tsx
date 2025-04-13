import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Plus, ShoppingCart, Calendar, Heart } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FloatingActionButtonProps {
  onAddToCart: () => void;
  onAddToMealPlan: () => void;
  onToggleFavorite: () => void;
  isFavorite: boolean;
}

export const FloatingActionButton: React.FC<FloatingActionButtonProps> = ({
  onAddToCart,
  onAddToMealPlan,
  onToggleFavorite,
  isFavorite,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className="fixed bottom-24 right-4 z-50">
      {/* Main FAB */}
      <Button
        onClick={toggleMenu}
        className={cn(
          "w-14 h-14 rounded-full shadow-lg transition-all duration-300",
          isOpen ? "bg-red-500" : "bg-blue-500"
        )}
      >
        <Plus className={cn("w-6 h-6 transition-transform duration-300", isOpen ? "rotate-45" : "")} />
      </Button>

      {/* Action Buttons */}
      <div
        className={cn(
          "absolute bottom-16 right-0 flex flex-col gap-2 transition-all duration-300",
          isOpen ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none"
        )}
      >
        <Button
          onClick={() => {
            onAddToCart();
            setIsOpen(false);
          }}
          className="w-12 h-12 rounded-full bg-green-500 shadow-lg"
        >
          <ShoppingCart className="w-5 h-5" />
        </Button>

        <Button
          onClick={() => {
            onAddToMealPlan();
            setIsOpen(false);
          }}
          className="w-12 h-12 rounded-full bg-purple-500 shadow-lg"
        >
          <Calendar className="w-5 h-5" />
        </Button>

        <Button
          onClick={() => {
            onToggleFavorite();
            setIsOpen(false);
          }}
          className={cn(
            "w-12 h-12 rounded-full shadow-lg",
            isFavorite ? "bg-red-500" : "bg-gray-500"
          )}
        >
          <Heart className="w-5 h-5" />
        </Button>
      </div>
    </div>
  );
}; 