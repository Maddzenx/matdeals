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
    <nav className="fixed w-full flex justify-around bg-white pt-1 bottom-0">
      {items.map((item) => (
        <button
          key={item.id}
          onClick={() => onSelect(item.id)}
          className={`flex flex-col items-center gap-0.5 text-[10px] font-bold relative px-4 py-1 ${
            item.active ? "text-[#191919]" : "text-[#9E9E9E]"
          }`}
        >
          {item.badge && (
            <div className="absolute text-white w-3 h-3 text-[8px] font-bold bg-[#DB2C17] rounded-[200px] -right-1.5 top-0.5">
              {item.badge}
            </div>
          )}
          <i className={`ti ti-${item.icon}`} />
          <span>{item.label}</span>
        </button>
      ))}
      <div className="w-[134px] h-[5px] bg-[#1C1C1C] mt-[11px] mb-2 mx-auto rounded-[100px]" />
    </nav>
  );
};
