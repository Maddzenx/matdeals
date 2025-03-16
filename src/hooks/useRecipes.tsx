
import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";
import { useSupabaseProducts } from "@/hooks/useSupabaseProducts";
import { calculateRecipeSavings } from "@/utils/ingredientsMatchUtils";
import { Product } from "@/data/types";

export interface Recipe {
  id: string;
  title: string;
  description: string | null;
  image_url: string | null;
  time_minutes: number | null;
  servings: number | null;
  difficulty: string | null;
  tags: string[] | null;
  ingredients: string[] | null;
  instructions: string[] | null;
  source_url: string | null;
  category: string | null;
  price: number | null;
  original_price: number | null;
  // New fields for calculated prices from ingredients
  calculatedPrice?: number | null;
  calculatedOriginalPrice?: number | null;
  savings?: number;
  matchedProducts?: Product[];
}

export const useRecipes = (initialCategory: string = "Middag") => {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>(initialCategory);
  const [categories, setCategories] = useState<string[]>([]);
  
  // Get products for matching with ingredients
  const { products } = useSupabaseProducts();

  const fetchRecipes = useCallback(async (category?: string) => {
    try {
      setLoading(true);
      setError(null);
      
      console.log(`Fetching recipes${category ? ` for category: ${category}` : ''}`);
      
      let query = supabase
        .from('recipes')
        .select('*');
        
      if (category) {
        // Using proper filter syntax
        query = query.or(`category.eq.${category},tags.cs.{"${category}"}`);
      }
      
      const { data, error: queryError } = await query;
      
      if (queryError) {
        console.error("Supabase query error:", queryError);
        throw queryError;
      }
      
      console.log(`Fetched ${data?.length || 0} recipes`);
      
      if (data) {
        // Add calculated prices based on matching ingredients with products
        const recipesWithPriceInfo = data.map((recipe: Recipe) => {
          // Calculate price info based on matching ingredients with products
          const { discountedPrice, originalPrice, savings, matchedProducts } = 
            calculateRecipeSavings(recipe.ingredients, products);
            
          return {
            ...recipe,
            calculatedPrice: discountedPrice || recipe.price,
            calculatedOriginalPrice: originalPrice || recipe.original_price,
            savings,
            matchedProducts
          };
        });
        
        setRecipes(recipesWithPriceInfo);
      }
    } catch (err) {
      console.error('Error fetching recipes:', err);
      setError(err instanceof Error ? err : new Error('Unknown error occurred'));
      
      toast({
        title: "Fel vid laddning av recept",
        description: "Kunde inte ladda recept från databasen. Försök igen senare.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }, [products]);

  const fetchCategories = useCallback(async () => {
    try {
      const { data, error: queryError } = await supabase
        .from('recipes')
        .select('tags, category');
        
      if (queryError) {
        console.error("Error fetching categories:", queryError);
        throw queryError;
      }
      
      if (data) {
        const allTags = data.flatMap(recipe => recipe.tags || []);
        const categoryValues = data.map(recipe => recipe.category).filter(Boolean);
        
        const allCategories = [...allTags, ...categoryValues];
        const uniqueCategories = [...new Set(allCategories)];
        
        uniqueCategories.sort();
        
        // Default categories to show even if no recipes yet
        const priorityCategories = ["Middag", "Vegetariskt", "Budget", "Veganskt", "Matlådevänligt"];
        
        const regularCategories = uniqueCategories.filter(
          cat => !priorityCategories.includes(cat)
        );
        
        // Combine priority categories that exist with other categories
        const availableCategories = [
          ...priorityCategories.filter(cat => uniqueCategories.includes(cat) || data.length === 0),
          ...regularCategories
        ];
        
        // If no categories are found, use default categories
        const finalCategories = availableCategories.length > 0 
          ? availableCategories 
          : ["Middag", "Vegetariskt"];
        
        setCategories(finalCategories);
        console.log("Available categories:", finalCategories);
        
        // If current active category is not in the available categories, select the first one
        if (finalCategories.length > 0 && !finalCategories.includes(activeCategory)) {
          setActiveCategory(finalCategories[0]);
        }
      }
    } catch (err) {
      console.error("Error loading categories:", err);
      // Set default categories if none found
      setCategories(["Middag", "Vegetariskt"]);
    }
  }, [activeCategory]);

  const scrapeRecipes = useCallback(async (showNotification = true) => {
    try {
      setLoading(true);
      
      console.log("Invoking scrape-recipes edge function...");
      
      // Call the Supabase Edge Function with empty body
      const { data, error: functionError } = await supabase.functions.invoke("scrape-recipes", {
        method: 'POST',
        body: {} // Required for POST
      });
      
      console.log("Edge function response:", data);
      
      if (functionError) {
        console.error("Edge function error:", functionError);
        throw new Error(functionError.message || 'Failed to scrape recipes');
      }
      
      if (!data || !data.success) {
        const errorMsg = data?.error || 'Unknown error occurred';
        console.error("Edge function failed:", errorMsg);
        throw new Error(errorMsg);
      }
      
      if (showNotification) {
        toast({
          title: "Recept uppdaterade",
          description: `${data.recipesCount} recept har hämtats`,
        });
      }
      
      // Refresh categories and recipes after scraping
      await fetchCategories();
      await fetchRecipes(activeCategory);
      
      return { success: true, count: data.recipesCount };
    } catch (err) {
      console.error('Error scraping recipes:', err);
      
      if (showNotification) {
        toast({
          title: "Fel vid hämtning av recept",
          description: err instanceof Error ? err.message : 'Ett okänt fel inträffade',
          variant: "destructive"
        });
      }
      
      return { success: false, error: err instanceof Error ? err.message : 'Unknown error' };
    } finally {
      setLoading(false);
    }
  }, [activeCategory, fetchCategories, fetchRecipes]);

  const changeCategory = useCallback((category: string) => {
    setActiveCategory(category);
    fetchRecipes(category);
  }, [fetchRecipes]);

  // Update recipes when products change
  useEffect(() => {
    if (products.length > 0 && recipes.length > 0) {
      console.log("Products updated, recalculating recipe prices...");
      
      const updatedRecipes = recipes.map(recipe => {
        const { discountedPrice, originalPrice, savings, matchedProducts } = 
          calculateRecipeSavings(recipe.ingredients, products);
          
        return {
          ...recipe,
          calculatedPrice: discountedPrice || recipe.price,
          calculatedOriginalPrice: originalPrice || recipe.original_price,
          savings,
          matchedProducts
        };
      });
      
      setRecipes(updatedRecipes);
    }
  }, [products]);

  useEffect(() => {
    fetchCategories();
    fetchRecipes(activeCategory);
  }, [fetchCategories, fetchRecipes, activeCategory]);

  return {
    recipes,
    loading,
    error,
    activeCategory,
    categories,
    changeCategory,
    scrapeRecipes
  };
};
