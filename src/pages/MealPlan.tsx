
import React, { useState } from "react";
import { BottomNav } from "@/components/BottomNav";
import { useNavigationState } from "@/hooks/useNavigationState";
import { useNavigate } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { WeeklyPlanView } from "@/components/meal-plan/WeeklyPlanView";
import { FavoriteRecipes } from "@/components/meal-plan/FavoriteRecipes";
import { PreviousRecipes } from "@/components/meal-plan/PreviousRecipes";
import { MealPlanHeader } from "@/components/meal-plan/MealPlanHeader";
import { useMealPlan } from "@/hooks/useMealPlan";

const MealPlan = () => {
  const navigate = useNavigate();
  const { navItems } = useNavigationState();
  const [activeTab, setActiveTab] = useState("weekly");
  const { mealPlan, favorites, previousRecipes, loading, addToMealPlan, toggleFavorite } = useMealPlan();

  const handleNavSelect = (id: string) => {
    console.log("Selected nav:", id);
  };

  return (
    <div className="min-h-screen pb-20 bg-white">
      <MealPlanHeader />

      <div className="p-4">
        <Tabs defaultValue="weekly" onValueChange={setActiveTab} value={activeTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-4 bg-gray-100">
            <TabsTrigger value="weekly">Veckans plan</TabsTrigger>
            <TabsTrigger value="favorites">Favoriter</TabsTrigger>
            <TabsTrigger value="previous">Tidigare</TabsTrigger>
          </TabsList>
          
          <TabsContent value="weekly">
            <WeeklyPlanView 
              mealPlan={mealPlan} 
              loading={loading} 
              onAddRecipe={(day, recipeId) => addToMealPlan(day, recipeId)}
            />
          </TabsContent>
          
          <TabsContent value="favorites">
            <FavoriteRecipes 
              recipes={favorites} 
              loading={loading} 
              onToggleFavorite={toggleFavorite}
              onAddToMealPlan={(recipeId) => {
                setActiveTab("weekly");
                // The user can select which day when they're back on the weekly view
              }}
            />
          </TabsContent>
          
          <TabsContent value="previous">
            <PreviousRecipes 
              recipes={previousRecipes} 
              loading={loading}
              onToggleFavorite={toggleFavorite}
              onAddToMealPlan={(recipeId) => {
                setActiveTab("weekly");
                // The user can select which day when they're back on the weekly view
              }}
            />
          </TabsContent>
        </Tabs>
      </div>

      <BottomNav items={navItems} onSelect={handleNavSelect} />
    </div>
  );
};

export default MealPlan;
