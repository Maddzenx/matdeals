
import { useMemo } from "react";
import { CartItem } from "@/hooks/useCartState";
import { determineProductCategory } from "@/utils/productTransformers";

interface CategoryGroups {
  [category: string]: CartItem[];
}

export const useCategoryGrouping = (cartItems: CartItem[]) => {
  const groupedByCategory = useMemo(() => {
    console.log("Grouping cart items by category:", cartItems.length);
    
    return cartItems.reduce((acc: CategoryGroups, item) => {
      // Determine category based on product name and details
      const categoryId = determineCategory(item.name, item.details || "");
      const categoryName = getCategoryDisplayName(categoryId);
      
      if (!acc[categoryName]) {
        acc[categoryName] = [];
      }
      acc[categoryName].push(item);
      return acc;
    }, {});
  }, [cartItems]);

  const sortedCategoryNames = useMemo(() => {
    const categoryOrder = [
      "Frukt & Grönt",
      "Kött",
      "Fisk & Skaldjur",
      "Mejeri",
      "Bröd",
      "Drycker",
      "Snacks",
      "Övriga produkter"
    ];
    
    // Get all category names from the grouped items
    const categories = Object.keys(groupedByCategory);
    
    // Sort categories based on predefined order
    return categories.sort((a, b) => {
      const indexA = categoryOrder.indexOf(a);
      const indexB = categoryOrder.indexOf(b);
      
      // If both categories are in the order array, sort by their position
      if (indexA !== -1 && indexB !== -1) {
        return indexA - indexB;
      }
      
      // If only one is in the order array, prioritize it
      if (indexA !== -1) return -1;
      if (indexB !== -1) return 1;
      
      // If neither is in the order array, sort alphabetically
      return a.localeCompare(b);
    });
  }, [groupedByCategory]);

  return { groupedByCategory, sortedCategoryNames };
};

// Helper function to determine category from product name and details
function determineCategory(name: string, details: string): string {
  const combined = (name + " " + details).toLowerCase();
  
  if (combined.includes("frukt") || combined.includes("grönsak") || 
      combined.includes("äpple") || combined.includes("banan") ||
      combined.includes("tomat") || combined.includes("sallad")) {
    return "fruits";
  } else if (combined.includes("kött") || combined.includes("fläsk") || 
             combined.includes("nöt") || combined.includes("kyckl") ||
             combined.includes("korv")) {
    return "meat";
  } else if (combined.includes("fisk") || combined.includes("lax") ||
             combined.includes("räk") || combined.includes("skaldjur")) {
    return "fish";
  } else if (combined.includes("mjölk") || combined.includes("ost") || 
             combined.includes("smör") || combined.includes("yoghurt") ||
             combined.includes("fil")) {
    return "dairy";
  } else if (combined.includes("bröd") || combined.includes("bulle") ||
             combined.includes("kaka")) {
    return "bread";
  } else if (combined.includes("dryck") || combined.includes("läsk") ||
             combined.includes("juice") || combined.includes("vatten") ||
             combined.includes("kaffe")) {
    return "drinks";
  } else if (combined.includes("godis") || combined.includes("chips") || 
             combined.includes("snack") || combined.includes("choklad")) {
    return "snacks";
  }
  
  return "other";
}

// Map category IDs to display names
function getCategoryDisplayName(categoryId: string): string {
  const categoryMap: Record<string, string> = {
    "fruits": "Frukt & Grönt",
    "meat": "Kött",
    "fish": "Fisk & Skaldjur",
    "dairy": "Mejeri",
    "bread": "Bröd",
    "drinks": "Drycker",
    "snacks": "Snacks",
    "other": "Övriga produkter"
  };
  
  return categoryMap[categoryId] || "Övriga produkter";
}
