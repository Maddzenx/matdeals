
import { Product } from "./types";
import { categoriesData, storeTagsData } from "./storeTagsData";
import { fruitProducts } from "./products/fruitProducts";
import { meatProducts } from "./products/meatProducts";
import { dairyProducts } from "./products/dairyProducts";
import { fishProducts } from "./products/fishProducts";
import { snackProducts } from "./products/snackProducts";

// Re-export the types and data
export { type Product, type CategoryData } from "./types";
export { categoriesData, storeTagsData };

// Combine all products by category
export const productsData: Record<string, Product[]> = {
  fruits: fruitProducts,
  meat: meatProducts,
  dairy: dairyProducts,
  fish: fishProducts,
  snacks: snackProducts,
  bread: [],
  readymeals: [],
  drinks: [],
  taco: [],
  pantry: [],
  household: [],
  other: [],
};
