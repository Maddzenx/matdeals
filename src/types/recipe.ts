import { Product } from "@/data/types";

export interface RecipeIngredient {
  name: string;
  amount: string | number;  // Allow both string and number
  unit?: string;
  notes?: string;
  substitutions?: string;
}

export interface RecipeInstructions {
  setup?: string[];
  preparation?: string[];
  cooking?: string[];
  finishing?: string[];
  storage?: string[];
}

export interface RecipeIngredients {
  main: RecipeIngredient[];
  sauce?: RecipeIngredient[];
  garnish?: RecipeIngredient[];
}

export interface Recipe {
  id: string;
  title: string;
  description: string | null;
  instructions: string[] | RecipeInstructions;  // Support both old and new format
  category: string;
  created_at?: string | null;
  ingredients: RecipeIngredient[] | RecipeIngredients;  // Support both old and new format
  store?: string;  // Add store field
  
  // Time breakdown
  prep_time_minutes?: number;
  cook_time_minutes?: number;
  total_time_minutes?: number;
  time_minutes?: number;  // Keep for backward compatibility
  
  // Serving details
  servings?: number;
  portion_size?: string;
  
  // Difficulty details
  difficulty?: string;
  difficulty_explanation?: string;
  
  // Equipment and additional information
  equipment_needed?: string[];
  tips?: string[];
  pairings?: string[];
  variations?: string[];
  
  // Frontend-calculated fields
  calculatedPrice?: number | null;
  calculatedOriginalPrice?: number | null;
  savings?: number;
  matchedProducts?: Product[];
  
  // Optional fields that may not be in the database but used in frontend
  image_url?: string;
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
  store?: string;  // Add store field
}

// Helper function to convert database recipe to frontend Recipe type
export function convertDatabaseRecipeToRecipe(dbRecipe: DatabaseRecipe): Recipe {
  // Determine default values based on category
  const getDefaultValues = (category: string) => {
    switch (category.toLowerCase()) {
      case 'frukost':
      case 'frukost & brunch':
        return { time: 15, servings: 2, difficulty: 'Lätt' };
      case 'lunch':
      case 'middag':
        return { time: 45, servings: 4, difficulty: 'Medel' };
      case 'efterrätt':
      case 'dessert':
        return { time: 30, servings: 6, difficulty: 'Medel' };
      case 'bakverk':
      case 'bröd':
        return { time: 120, servings: 8, difficulty: 'Avancerad' };
      case 'vegetariskt':
      case 'veganskt':
        return { time: 40, servings: 4, difficulty: 'Medel' };
      case 'fisk & skaldjur':
        return { time: 35, servings: 4, difficulty: 'Medel' };
      case 'kyckling':
        return { time: 50, servings: 4, difficulty: 'Medel' };
      case 'kött':
        return { time: 60, servings: 4, difficulty: 'Medel' };
      case 'soppa':
        return { time: 30, servings: 6, difficulty: 'Lätt' };
      case 'sallad':
        return { time: 20, servings: 4, difficulty: 'Lätt' };
      default:
        return { time: 30, servings: 4, difficulty: 'Medel' };
    }
  };

  const defaults = getDefaultValues(dbRecipe.category);

  return {
    id: dbRecipe.id,
    title: dbRecipe.title,
    description: dbRecipe.description,
    instructions: dbRecipe.instructions || [],
    category: dbRecipe.category,
    created_at: dbRecipe.created_at,
    ingredients: dbRecipe.ingredients.map(ing => ({
      ...ing,
      amount: String(ing.amount) // Convert amount to string for consistency
    })),
    image_url: dbRecipe.image_url || "https://placehold.co/600x400?text=No+Image",
    time_minutes: dbRecipe.time_minutes || defaults.time,
    servings: dbRecipe.servings || defaults.servings,
    difficulty: dbRecipe.difficulty || defaults.difficulty,
    source_url: dbRecipe.source_url || null,
    store: dbRecipe.store || undefined
  };
}
