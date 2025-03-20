
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Index from "./pages/Index";
import ShoppingList from "./pages/ShoppingList";
import Auth from "./pages/Auth";
import Recipes from "./pages/Recipes";
import RecipeDetail from "./pages/RecipeDetail";
import MealPlan from "./pages/MealPlan";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/shopping-list" element={<ShoppingList />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/recipes" element={<Recipes />} />
          <Route path="/recipe/:id" element={<RecipeDetail />} />
          <Route path="/meal-plan" element={<MealPlan />} />
          {/* Redirect /menu to /meal-plan */}
          <Route path="/menu" element={<Navigate replace to="/meal-plan" />} />
          {/* Redirect /offers to root since that's our home page */}
          <Route path="/offers" element={<Navigate replace to="/" />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
