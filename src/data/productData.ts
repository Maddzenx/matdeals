
import { Product } from "./types";
import { categoriesData, storeTagsData } from "./storeTagsData";

// Re-export the types and data
export { type Product, type CategoryData } from "./types";
export { categoriesData, storeTagsData };

// An empty object for products as we're now using Supabase for product data
export const productsData: Record<string, Product[]> = {
  fruits: [],
  meat: [],
  dairy: [],
  fish: [],
  snacks: [],
  bread: [],
  readymeals: [],
  drinks: [],
  taco: [],
  pantry: [],
  household: [],
  other: [],
};
