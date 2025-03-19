
import React from "react";
import { CalendarDays } from "lucide-react";

export const MealPlanHeader: React.FC = () => {
  return (
    <div className="bg-gradient-to-r from-[#fdfcfb] to-[#f6f5f3] py-5 px-4 border-b border-gray-200 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <CalendarDays className="mr-3 text-[#DB2C17]" size={24} />
          <h1 className="text-xl font-bold">Matsedel</h1>
        </div>
        <div className="text-sm text-gray-500 bg-white px-3 py-1 rounded-full border border-gray-200 shadow-sm">
          Vecka {getCurrentWeekNumber()}
        </div>
      </div>
    </div>
  );
};

// Helper function to get current week number
const getCurrentWeekNumber = (): number => {
  const now = new Date();
  const firstDayOfYear = new Date(now.getFullYear(), 0, 1);
  const pastDaysOfYear = (now.getTime() - firstDayOfYear.getTime()) / 86400000;
  return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
};

