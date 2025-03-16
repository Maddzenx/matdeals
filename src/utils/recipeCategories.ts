
import { supabase } from "@/integrations/supabase/client";

export const fetchRecipeCategories = async (activeCategory: string): Promise<{
  categories: string[];
  newActiveCategory?: string;
}> => {
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
      
      console.log("Available categories:", finalCategories);
      
      // If current active category is not in the available categories, return the first one
      let newActiveCategory;
      if (finalCategories.length > 0 && !finalCategories.includes(activeCategory)) {
        newActiveCategory = finalCategories[0];
      }
      
      return { 
        categories: finalCategories,
        newActiveCategory
      };
    }
    
    return { categories: ["Middag", "Vegetariskt"] };
  } catch (err) {
    console.error("Error loading categories:", err);
    // Set default categories if none found
    return { categories: ["Middag", "Vegetariskt"] };
  }
};
