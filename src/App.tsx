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
import { ApiTest } from '@/components/ApiTest';
import { useAutoRecipeGeneration } from '@/hooks/useAutoRecipeGeneration';
import { ThemeProvider } from "@/components/theme-provider";
import EnvTest from '@/components/EnvTest';

// Create a client for React Query with default options
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: false,
      staleTime: 1000 * 60 * 5, // 5 minutes
    },
  },
});

function AppContent() {
  // Enable automatic recipe generation
  useAutoRecipeGeneration();

  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <TooltipProvider>
        <div className="min-h-screen">
          <Routes>
            <Route path="/" element={<Erbjudande />} />
            <Route path="/recipes" element={<Recipes />} />
            <Route path="/recipe/:id" element={<RecipeDetail />} />
            <Route path="/shopping-list" element={<ShoppingList />} />
            <Route path="/meal-plan" element={<MealPlan />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/api-test" element={<ApiTest />} />
            <Route path="/env-test" element={<EnvTest />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
          <Toaster />
        </div>
      </TooltipProvider>
    </ThemeProvider>
  );
}

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </QueryClientProvider>
  );
};

export default App;
