import { Product } from "@/data/types";

export interface RecipeIngredient {
  name: string;
  amount: string;
  unit?: string;
  notes?: string;
}

export interface Recipe {
  id: string;
  title: string;
  description: string | null;
  instructions: string[];
  category: string;
  created_at?: string | null;
  ingredients: RecipeIngredient[];
  
  // Frontend-calculated fields
  calculatedPrice?: number | null;
  calculatedOriginalPrice?: number | null;
  savings?: number;
  matchedProducts?: Product[];
  
  // Optional fields that may not be in the database but used in frontend
  image_url?: string;
  time_minutes?: number | null;
  servings?: number | null;
  difficulty?: string | null;
  author?: string;
  tags?: string[];
  original_price?: number | null;
  price?: number | null;
  source_url?: string | null;
}

export interface DatabaseRecipe {
  id: string;
  title: string;
  description: string | null;
  instructions: string[];
  category: string;
  created_at?: string | null;
  ingredients: RecipeIngredient[];
  image_url?: string;
  time_minutes?: number | null;
  servings?: number | null;
  difficulty?: string | null;
  source_url?: string | null;
}

// Helper function to convert database recipe to frontend Recipe type
export function convertDatabaseRecipeToRecipe(dbRecipe: DatabaseRecipe): Recipe {
  return {
    id: dbRecipe.id,
    title: dbRecipe.title,
    description: dbRecipe.description,
    instructions: dbRecipe.instructions || [],
    category: dbRecipe.category,
    created_at: dbRecipe.created_at,
    ingredients: dbRecipe.ingredients,
    image_url: dbRecipe.image_url || "https://placehold.co/600x400?text=No+Image", // Default image
    time_minutes: dbRecipe.time_minutes || 30, // Default time
    servings: dbRecipe.servings || 4, // Default servings
    difficulty: dbRecipe.difficulty || "medium", // Default difficulty
    source_url: dbRecipe.source_url || null // Add source_url field
  };
}
