import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/toaster";
import Erbjudande from "@/pages/Erbjudande";
import Recipes from "@/pages/Recipes";
import ShoppingList from "@/pages/ShoppingList";
import MealPlan from "@/pages/MealPlan";
import Auth from "@/pages/Auth";
import RecipeDetail from "@/pages/RecipeDetail";
import NotFound from "@/pages/NotFound";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Erbjudande />} />
            <Route path="/recipes" element={<Recipes />} />
            <Route path="/recipe/:recipeId" element={<RecipeDetail />} />
            <Route path="/shopping-list" element={<ShoppingList />} />
            <Route path="/meal-plan" element={<MealPlan />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
          <Toaster />
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
