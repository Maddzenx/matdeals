import { Product } from './product';

export interface MatchedIngredient {
  name: string;
  amount?: string | number;
  unit?: string;
  notes?: string;
  matchedProduct?: Product;
} 