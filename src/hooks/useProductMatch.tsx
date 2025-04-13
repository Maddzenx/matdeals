import { useCallback } from "react";
import { Product } from "@/data/types";

interface Ingredient {
  name: string;
  amount?: string;
  unit?: string;
  notes?: string;
}

interface MatchedIngredient extends Ingredient {
  matchedProduct?: Product;
}

// Mock data - in a real app, this would be fetched from the database
const allProducts: Product[] = [
  // Sample product data for matching
  {
    id: "p1",
    name: "Äpple Royal Gala",
    currentPrice: "24.90 kr",
    originalPrice: "29.90 kr",
    image: "https://assets.icanet.se/e_sharpen:100,q_auto,dpr_1.25,w_718,h_718,c_lfill/imagevaultfiles/id_226367/cf_259/morotter_i_knippe.jpg",
    store: "willys",
    category: "fruit",
    details: "Willys, Italien, Klass 1",
    offerBadge: "Erbjudande"
  },
  {
    id: "p2",
    name: "Färsk Kycklingfilé",
    currentPrice: "89.90 kr",
    originalPrice: "109.90 kr",
    image: "https://assets.icanet.se/e_sharpen:100,q_auto,dpr_1.25,w_718,h_718,c_lfill/imagevaultfiles/id_226367/cf_259/morotter_i_knippe.jpg",
    store: "willys",
    category: "meat",
    details: "Kronfågel, Sverige, 700-925g",
    offerBadge: "Erbjudande"
  },
  {
    id: "p3",
    name: "Kavli Mjukost",
    currentPrice: "29.90 kr",
    originalPrice: "34.90 kr",
    image: "https://assets.icanet.se/e_sharpen:100,q_auto,dpr_1.25,w_718,h_718,c_lfill/imagevaultfiles/id_226367/cf_259/morotter_i_knippe.jpg",
    store: "willys",
    category: "dairy",
    details: "Willys, Flera smaker, 275g",
    offerBadge: "Erbjudande"
  }
];

export function useProductMatch() {
  // Function to find matching products for recipe ingredients
  const findMatchingProducts = useCallback((ingredients: (string | Ingredient)[]) => {
    // Default empty array if ingredients is not provided
    if (!ingredients || !Array.isArray(ingredients)) {
      return { matchedProducts: [], matchedIngredients: [] };
    }

    const matchedProducts: Product[] = [];
    const matchedIngredients: MatchedIngredient[] = [];
    
    // Simple matching logic - in a real app, this would be more sophisticated
    ingredients.forEach(ingredient => {
      let ingredientName = "";
      let ingredientObj: Ingredient;
      
      // Handle different ingredient formats
      if (typeof ingredient === 'string') {
        ingredientName = ingredient;
        ingredientObj = { name: ingredient };
      } else {
        ingredientName = ingredient.name;
        ingredientObj = ingredient;
      }
      
      // Find matching product
      const matchingProduct = allProducts.find(product => 
        product.name.toLowerCase().includes(ingredientName.toLowerCase())
      );
      
      if (matchingProduct) {
        matchedProducts.push(matchingProduct);
        matchedIngredients.push({
          ...ingredientObj,
          matchedProduct: matchingProduct
        });
      } else {
        matchedIngredients.push(ingredientObj);
      }
    });
    
    return { matchedProducts, matchedIngredients };
  }, []);

  return { findMatchingProducts };
}
