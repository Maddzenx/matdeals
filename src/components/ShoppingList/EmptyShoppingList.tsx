
import React from "react";
import { useNavigate } from "react-router-dom";

export const EmptyShoppingList: React.FC = () => {
  const navigate = useNavigate();
  
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <p className="text-lg font-medium text-gray-500 mb-4">Din inköpslista är tom</p>
      <button
        onClick={() => navigate("/")}
        className="text-white text-center text-sm font-bold bg-[#DB2C17] px-4 py-2 rounded-[100px]"
      >
        Gå till erbjudanden
      </button>
    </div>
  );
};
