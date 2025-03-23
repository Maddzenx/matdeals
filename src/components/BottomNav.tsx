
import React from "react";
import { ShoppingCart, Search, BookOpen, Percent, User, Calendar } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";

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
  const navigate = useNavigate();
  const location = useLocation();

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case "shopping-cart":
        return <ShoppingCart size={22} />; 
      case "search":
        return <Search size={22} />; 
      case "book":
        return <BookOpen size={22} />; 
      case "discount":
        return <Percent size={22} />; 
      case "user":
        return <User size={22} />; 
      case "calendar":
        return <Calendar size={22} />; 
      default:
        return <div className="w-5.5 h-5.5" />;
    }
  };

  const handleNavItemClick = (id: string) => {
    switch (id) {
      case "recipes":
        navigate("/recipes");
        break;
      case "offers":
        navigate("/");
        break;
      case "cart":
        navigate("/shopping-list");
        break;
      case "profile":
        navigate("/auth");
        break;
      case "menu":
        navigate("/meal-plan"); 
        break;
      default:
        console.log("Selected nav:", id);
    }
    
    onSelect(id);
  };

  return (
    <nav className="fixed w-full flex justify-around items-center bg-white py-2.5 bottom-0 shadow-[0_-2px_10px_rgba(0,0,0,0.05)] border-t border-gray-200 z-50">
      {items.map((item) => (
        <button
          key={item.id}
          onClick={() => handleNavItemClick(item.id)}
          className={`flex flex-col items-center gap-1 text-xs font-bold relative px-4 py-2 transition-colors ${
            item.active ? "text-[#191919]" : "text-[#9E9E9E] hover:text-[#585858]"
          }`}
          aria-label={item.label}
        >
          {item.badge !== undefined && (
            <div className={`absolute flex items-center justify-center text-white 
              ${item.badge > 9 ? 'min-w-7 h-7 text-xs px-1' : 'w-6 h-6 text-xs'} 
              font-bold bg-[#DB2C17] rounded-full -right-1 -top-1 
              shadow-sm transition-all duration-300 animate-scale-in`}>
              {item.badge}
            </div>
          )}
          <div className="text-current">
            {getIcon(item.icon)}
          </div>
          <span className="text-xs">{item.label}</span>
        </button>
      ))}
      <div className="absolute w-[134px] h-[5px] bg-[#1C1C1C] bottom-1 left-1/2 -translate-x-1/2 rounded-[100px]" />
    </nav>
  );
};
