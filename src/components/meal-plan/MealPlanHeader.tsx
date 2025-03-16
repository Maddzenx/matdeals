
import React from "react";
import { Calendar } from "lucide-react";

export const MealPlanHeader: React.FC = () => {
  return (
    <div className="bg-white py-4 px-4 border-b border-gray-200">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <Calendar className="mr-2 text-[#DB2C17]" size={20} />
          <h1 className="text-xl font-bold">Matsedel</h1>
        </div>
        <span className="text-sm text-gray-500">Veckans planering</span>
      </div>
    </div>
  );
};
