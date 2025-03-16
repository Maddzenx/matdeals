
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
  // Calculated prices from ingredients
  calculatedPrice?: number | null;
  calculatedOriginalPrice?: number | null;
  savings?: number;
  matchedProducts?: Product[];
}
