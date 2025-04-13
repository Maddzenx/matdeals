import { Product } from '@/data/types';

export interface MatchedIngredient {
  name: string;
  amount?: string | number;
  unit?: string;
  notes?: string;
  matchedProduct?: Product;
} 