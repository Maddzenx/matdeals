
import React from "react";

interface NavItem {
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
  return (
    <nav className="fixed w-full flex justify-around items-center bg-white pt-1 bottom-0 shadow-[0_-2px_10px_rgba(0,0,0,0.05)]">
      {items.map((item) => (
        <button
          key={item.id}
          onClick={() => onSelect(item.id)}
          className={`flex flex-col items-center gap-0.5 text-[10px] font-bold relative px-3 py-2 ${
            item.active ? "text-[#191919]" : "text-[#9E9E9E]"
          }`}
        >
          {item.badge && (
            <div className="absolute flex items-center justify-center text-white w-3 h-3 text-[8px] font-bold bg-[#DB2C17] rounded-full -right-0.5 top-0">
              {item.badge}
            </div>
          )}
          <i className={`ti ti-${item.icon} text-base`} />
          <span>{item.label}</span>
        </button>
      ))}
      <div className="absolute w-[134px] h-[5px] bg-[#1C1C1C] bottom-2 left-1/2 -translate-x-1/2 rounded-[100px]" />
    </nav>
  );
};
