
import { Product } from "@/data/types";

/**
 * Checks if a product name matches an ingredient string
 */
export const productMatchesIngredient = (
  productName: string,
  ingredient: string
): boolean => {
  const productNameLower = productName.toLowerCase();
  const ingredientLower = ingredient.toLowerCase();
  
  // First check if product name is contained in the ingredient
  if (ingredientLower.includes(productNameLower)) {
    return true;
  }
  
  // Split ingredient into words and check if enough words match
  const ingredientWords = ingredientLower
    .split(/\s+/)
    .filter(word => word.length > 2); // Filter out short words
  
  const productWords = productNameLower
    .split(/\s+/)
    .filter(word => word.length > 2);
  
  // Count matches
  let matchCount = 0;
  for (const productWord of productWords) {
    if (ingredientWords.some(ingredientWord => 
      ingredientWord.includes(productWord) || 
      productWord.includes(ingredientWord)
    )) {
      matchCount++;
    }
  }
  
  // If more than half of the significant words match, consider it a match
  return matchCount >= Math.ceil(productWords.length / 2);
};

/**
 * Finds matching products for recipe ingredients
 */
export const findMatchingProducts = (
  ingredients: string[] | null,
  products: Product[]
): Product[] => {
  if (!ingredients || ingredients.length === 0 || !products || products.length === 0) {
    return [];
  }
  
  const matches: Product[] = [];
  
  // Find matching products for each ingredient
  for (const ingredient of ingredients) {
    for (const product of products) {
      if (productMatchesIngredient(product.name, ingredient)) {
        matches.push(product);
        break; // Only add the first matching product per ingredient
      }
    }
  }
  
  return matches;
};

/**
 * Calculate savings for a recipe based on matching discounted products
 */
export const calculateRecipeSavings = (
  ingredients: string[] | null,
  products: Product[]
): { 
  discountedPrice: number | null;
  originalPrice: number | null;
  savings: number;
  matchedProducts: Product[];
} => {
  if (!ingredients || ingredients.length === 0) {
    return { discountedPrice: null, originalPrice: null, savings: 0, matchedProducts: [] };
  }
  
  const matchedProducts = findMatchingProducts(ingredients, products);
  
  if (matchedProducts.length === 0) {
    return { discountedPrice: null, originalPrice: null, savings: 0, matchedProducts: [] };
  }
  
  let totalSavings = 0;
  let discountedPrice = 0;
  let originalPrice = 0;
  
  matchedProducts.forEach(product => {
    // Extract numeric prices
    const currentPrice = extractNumericPrice(product.currentPrice);
    const origPrice = extractNumericPrice(product.originalPrice);
    
    if (currentPrice !== null) {
      discountedPrice += currentPrice;
      
      if (origPrice !== null && origPrice > currentPrice) {
        originalPrice += origPrice;
        totalSavings += (origPrice - currentPrice);
      } else {
        originalPrice += currentPrice; // Use current price if no original price
      }
    }
  });
  
  return {
    discountedPrice: discountedPrice > 0 ? discountedPrice : null,
    originalPrice: originalPrice > 0 ? originalPrice : null,
    savings: totalSavings,
    matchedProducts
  };
};

/**
 * Extract numeric price from a price string
 */
const extractNumericPrice = (priceStr: string | undefined): number | null => {
  if (!priceStr) return null;
  
  // Extract numbers from strings like "25:- kr", "25.90 kr", etc.
  const match = priceStr.match(/(\d+[.,]?\d*)/);
  if (match && match[1]) {
    return parseFloat(match[1].replace(',', '.'));
  }
  return null;
};
