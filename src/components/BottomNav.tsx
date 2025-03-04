
import React from "react";
import { ShoppingCart, Search, BookOpen, Percent, User } from "lucide-react";

export interface NavItem {
  id: string;
  icon: string;
  label: string;
  badge?: number;
  active?: boolean;
}

interface BottomNavProps {
  items: NavItem[];
  onSelect: (id: string) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ items, onSelect }) => {
  const getIcon = (iconName: string) => {
    switch (iconName) {
      case "shopping-cart":
        return <ShoppingCart size={18} />;
      case "search":
        return <Search size={18} />;
      case "book":
        return <BookOpen size={18} />;
      case "discount":
        return <Percent size={18} />;
      case "user":
        return <User size={18} />;
      default:
        return <div className="w-4.5 h-4.5" />;
    }
  };

  return (
    <nav className="fixed w-full flex justify-around items-center bg-white py-1.5 bottom-0 shadow-[0_-2px_10px_rgba(0,0,0,0.05)] border-t border-gray-200 z-50">
      {items.map((item) => (
        <button
          key={item.id}
          onClick={() => onSelect(item.id)}
          className={`flex flex-col items-center gap-0.5 text-[10px] font-bold relative px-3 py-1.5 transition-colors ${
            item.active ? "text-[#191919]" : "text-[#9E9E9E] hover:text-[#585858]"
          }`}
          aria-label={item.label}
        >
          {item.badge !== undefined && (
            <div className="absolute flex items-center justify-center text-white w-4 h-4 text-[8px] font-bold bg-[#DB2C17] rounded-full -right-0.5 top-0">
              {item.badge}
            </div>
          )}
          <div className="text-current">
            {getIcon(item.icon)}
          </div>
          <span>{item.label}</span>
        </button>
      ))}
      <div className="absolute w-[134px] h-[4px] bg-[#1C1C1C] bottom-1 left-1/2 -translate-x-1/2 rounded-[100px]" />
    </nav>
  );
};
