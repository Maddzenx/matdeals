
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
import { Calendar, Heart, Clock } from "lucide-react";

const MealPlan = () => {
  const navigate = useNavigate();
  const { navItems } = useNavigationState();
  const [activeTab, setActiveTab] = useState("weekly");
  const { mealPlan, favorites, previousRecipes, loading, addToMealPlan, addToMultipleDays, toggleFavorite } = useMealPlan();

  const handleNavSelect = (id: string) => {
    console.log("Selected nav:", id);
  };

  // Handle selecting a day for a recipe
  const handleSelectDay = (day: string, recipeId: string) => {
    addToMealPlan(day, recipeId);
    // Switch to weekly view after selecting a day
    setActiveTab("weekly");
  };

  // Handle selecting multiple days for a recipe
  const handleSelectMultipleDays = (days: string[], recipeId: string) => {
    addToMultipleDays(days, recipeId);
    // Switch to weekly view after selecting days
    setActiveTab("weekly");
  };

  return (
    <div className="min-h-screen pb-20 bg-white">
      <MealPlanHeader />

      <div className="px-4 pt-2">
        <Tabs defaultValue="weekly" onValueChange={setActiveTab} value={activeTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6 bg-gray-50 p-1 rounded-lg">
            <TabsTrigger 
              value="weekly" 
              className="flex items-center gap-1.5 data-[state=active]:bg-white data-[state=active]:shadow-sm"
            >
              <Calendar size={14} />
              <span>Veckans plan</span>
            </TabsTrigger>
            <TabsTrigger 
              value="favorites" 
              className="flex items-center gap-1.5 data-[state=active]:bg-white data-[state=active]:shadow-sm"
            >
              <Heart size={14} />
              <span>Favoriter</span>
            </TabsTrigger>
            <TabsTrigger 
              value="previous" 
              className="flex items-center gap-1.5 data-[state=active]:bg-white data-[state=active]:shadow-sm"
            >
              <Clock size={14} />
              <span>Tidigare</span>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="weekly" className="pt-2 animate-fade-in">
            <WeeklyPlanView 
              mealPlan={mealPlan} 
              loading={loading} 
              onAddRecipe={(day, recipeId) => addToMealPlan(day, recipeId)}
            />
          </TabsContent>
          
          <TabsContent value="favorites" className="animate-fade-in">
            <FavoriteRecipes 
              recipes={favorites} 
              loading={loading} 
              onToggleFavorite={toggleFavorite}
              onAddToMealPlan={(recipeId) => {
                setActiveTab("weekly");
              }}
              mealPlan={mealPlan}
              onSelectDay={handleSelectDay}
              onSelectMultipleDays={handleSelectMultipleDays}
            />
          </TabsContent>
          
          <TabsContent value="previous" className="animate-fade-in">
            <PreviousRecipes 
              recipes={previousRecipes} 
              loading={loading}
              onToggleFavorite={toggleFavorite}
              onAddToMealPlan={(recipeId) => {
                setActiveTab("weekly");
              }}
              mealPlan={mealPlan}
              onSelectDay={handleSelectDay}
              onSelectMultipleDays={handleSelectMultipleDays}
            />
          </TabsContent>
        </Tabs>
      </div>

      <BottomNav items={navItems} onSelect={handleNavSelect} />
    </div>
  );
};

export default MealPlan;
