
import React, { useState } from "react";
import { BottomNav } from "@/components/BottomNav";
import { useNavigationState } from "@/hooks/useNavigationState";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Clock, User } from "lucide-react";

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
    },
    {
      id: "3",
      title: "Vegetarisk Lasagne",
      originalPrice: "109 kr",
      discountPrice: "85 kr",
      image: "/public/lovable-uploads/6e834c3d-51f8-47f5-8a4d-691f143cefdc.png",
      timeMinutes: 35,
      tags: ["Familjemåltider"]
    },
    {
      id: "4",
      title: "Sallad med Halloumi",
      originalPrice: "89 kr",
      discountPrice: "69 kr",
      image: "/public/lovable-uploads/6e834c3d-51f8-47f5-8a4d-691f143cefdc.png",
      timeMinutes: 15,
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
    <div className="min-h-screen pb-20 bg-gray-50">
      <div className="px-4 pt-6 pb-4 bg-white sticky top-0 z-10 shadow-sm">
        <h1 className="text-2xl font-bold text-left">Upptäck Recept</h1>
        
        <div className="mt-4">
          <div className="flex space-x-6 overflow-x-auto pb-2 no-scrollbar">
            {categories.map((category) => (
              <button
                key={category}
                className={`pb-2 px-1 font-medium text-sm whitespace-nowrap transition-colors ${
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

      <div className="px-4 py-4">
        <div className="grid grid-cols-1 gap-4">
          {recipes.map((recipe) => (
            <Card 
              key={recipe.id} 
              className="overflow-hidden hover:shadow-md transition-shadow"
            >
              <div className="h-48 bg-gray-200 relative">
                <img 
                  src={recipe.image}
                  alt={recipe.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4">
                  <h3 className="text-xl font-bold text-white">{recipe.title}</h3>
                </div>
              </div>
              <CardContent className="p-4">
                <div className="flex gap-2 mb-4">
                  {recipe.tags.map((tag) => (
                    <span 
                      key={tag}
                      className="bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full text-xs font-medium flex items-center"
                    >
                      {tag === "Familjemåltider" ? <User size={12} className="mr-1" /> : null}
                      {tag === "Träning" ? <User size={12} className="mr-1" /> : null}
                      {tag}
                    </span>
                  ))}
                  <span className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-xs font-medium flex items-center">
                    <Clock size={12} className="mr-1" /> {recipe.timeMinutes} min
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-baseline">
                    <span className="text-gray-500 line-through text-sm mr-2">{recipe.originalPrice}</span>
                    <span className="text-indigo-600 font-bold text-lg">{recipe.discountPrice}</span>
                  </div>
                  <button className="bg-indigo-600 text-white px-4 py-2 rounded-full text-sm font-medium hover:bg-indigo-700 transition-colors">
                    Lägg till
                  </button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <BottomNav items={navItems} onSelect={handleNavSelect} />
    </div>
  );
};

export default Recipes;
