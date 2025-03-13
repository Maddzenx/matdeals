
import React, { useState } from "react";
import { BottomNav } from "@/components/BottomNav";
import { useNavigationState } from "@/hooks/useNavigationState";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

type RecipeCategory = "Matlådevänligt" | "Budget" | "Veganskt" | "Vegetariskt";
type RecipeTag = "Familjemåltider" | "Träning";

interface Recipe {
  id: string;
  title: string;
  originalPrice: string;
  discountPrice: string;
  image: string;
  timeMinutes: number;
  tags: RecipeTag[];
  category?: RecipeCategory;
}

const Recipes = () => {
  const navigate = useNavigate();
  const { navItems, handleProductQuantityChange } = useNavigationState();
  const [activeCategory, setActiveCategory] = useState<RecipeCategory>("Matlådevänligt");

  // Sample recipe data based on the screenshot
  const recipes: Recipe[] = [
    {
      id: "1",
      title: "Krämig Laxpasta",
      originalPrice: "119 kr",
      discountPrice: "89 kr",
      image: "/public/lovable-uploads/6e834c3d-51f8-47f5-8a4d-691f143cefdc.png",
      timeMinutes: 25,
      tags: ["Familjemåltider"]
    },
    {
      id: "2",
      title: "Kycklingbowl med Quinoa",
      originalPrice: "99 kr",
      discountPrice: "79 kr",
      image: "/public/lovable-uploads/6e834c3d-51f8-47f5-8a4d-691f143cefdc.png",
      timeMinutes: 20,
      tags: ["Träning"]
    }
  ];

  const categories: RecipeCategory[] = [
    "Matlådevänligt",
    "Budget",
    "Veganskt",
    "Vegetariskt"
  ];

  const handleNavSelect = (id: string) => {
    if (id === "cart") {
      navigate("/shopping-list");
    } else if (id === "profile") {
      navigate("/auth");
    } else if (id === "offers") {
      navigate("/");
    } else {
      console.log("Selected nav:", id);
    }
  };

  return (
    <div className="min-h-screen pb-20">
      <div className="px-4 pt-6 pb-4">
        <h1 className="text-3xl font-bold">Upptäck Recept</h1>
        
        <div className="mt-4 border-b border-gray-200">
          <div className="flex space-x-6 overflow-x-auto pb-2">
            {categories.map((category) => (
              <button
                key={category}
                className={`pb-2 font-medium text-sm whitespace-nowrap ${
                  activeCategory === category 
                    ? "text-black border-b-2 border-black" 
                    : "text-gray-500"
                }`}
                onClick={() => setActiveCategory(category)}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="px-4 py-4 space-y-4">
        {recipes.map((recipe) => (
          <div 
            key={recipe.id} 
            className="bg-white rounded-lg shadow-sm overflow-hidden"
          >
            <div className="h-48 bg-gray-200 relative">
              <img 
                src={recipe.image}
                alt={recipe.title}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="p-4">
              <div className="flex gap-2 mb-2">
                {recipe.tags.map((tag) => (
                  <span 
                    key={tag}
                    className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-xs font-medium"
                  >
                    {tag}
                  </span>
                ))}
                <span className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-xs font-medium flex items-center">
                  {recipe.timeMinutes} min
                </span>
              </div>
              
              <h3 className="text-xl font-bold mb-2">{recipe.title}</h3>
              
              <div className="flex items-center">
                <span className="text-gray-500 line-through mr-2">{recipe.originalPrice}</span>
                <span className="text-indigo-600 font-bold text-lg">{recipe.discountPrice}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <BottomNav items={navItems} onSelect={handleNavSelect} />
    </div>
  );
};

export default Recipes;
