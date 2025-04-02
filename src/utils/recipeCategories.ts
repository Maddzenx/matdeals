
import { supabase } from "@/integrations/supabase/client";

export interface RecipeCategory {
  id: string;
  name: string;
  count: number;
}

export const getRecipeCategories = async (): Promise<RecipeCategory[]> => {
  try {
    // Get all recipe categories
    // First attempt to get unique tags
    const { data: recipesData, error } = await supabase
      .from('recipes')
      .select('category');
      
    if (error) {
      console.error("Error fetching recipe categories:", error);
      throw error;
    }
    
    if (!recipesData || recipesData.length === 0) {
      return [];
    }
    
    // Count unique categories
    const categoryCount: Record<string, number> = {};
    
    recipesData.forEach(recipe => {
      const category = recipe.category;
      if (category) {
        if (!categoryCount[category]) {
          categoryCount[category] = 0;
        }
        categoryCount[category]++;
      }
    });
    
    // Convert to array of category objects
    const categories: RecipeCategory[] = Object.entries(categoryCount)
      .map(([name, count]) => ({
        id: name,
        name,
        count
      }))
      .sort((a, b) => b.count - a.count);
      
    return categories;
  } catch (err) {
    console.error("Error getting recipe categories:", err);
    return [];
  }
};

// Default recipe categories in case we can't fetch from the server
export const defaultRecipeCategories: RecipeCategory[] = [
  { id: 'dinner', name: 'Middag', count: 0 },
  { id: 'lunch', name: 'Lunch', count: 0 },
  { id: 'breakfast', name: 'Frukost', count: 0 },
  { id: 'dessert', name: 'Efterrätt', count: 0 },
  { id: 'vegetarian', name: 'Vegetariskt', count: 0 }
];
