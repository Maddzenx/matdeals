
import { STORE_NAME, BASE_URL } from "./config/scraper-config.ts";
import { extractFromWeeklyOffers } from "./extractors/weekly-offers-extractor.ts";
import { extractGridItems } from "./extractors/grid-items-extractor.ts";

/**
 * Extract products from the Willys web page
 * This function combines multiple extraction strategies to get the most product data
 */
export function extractProducts(document: Document, baseUrl: string, storeName: string): any[] {
  console.log("Extracting products from Willys webpage");
  
  try {
    // Try multiple extraction methods and combine results
    const products: any[] = [];
    
    // Method 1: Extract from weekly offers section
    const weeklyOffers = extractFromWeeklyOffers(document, baseUrl);
    if (weeklyOffers.length > 0) {
      console.log(`Extracted ${weeklyOffers.length} products from weekly offers section`);
      products.push(...weeklyOffers);
    } else {
      console.log("No products found in weekly offers section");
    }
    
    // Method 2: Extract from grid items
    const gridItems = extractGridItems(document, baseUrl);
    if (gridItems.length > 0) {
      console.log(`Extracted ${gridItems.length} products from grid items`);
      products.push(...gridItems);
    } else {
      console.log("No products found in grid items");
    }
    
    // Ensure each product has the store property set
    products.forEach(product => {
      product.store = storeName.toLowerCase();
    });
    
    // De-duplicate products by name
    const uniqueProducts = Array.from(
      new Map(products.map(item => [item.name, item])).values()
    );
    
    console.log(`Total products extracted: ${products.length}`);
    console.log(`After de-duplication: ${uniqueProducts.length} unique products`);
    
    return uniqueProducts;
  } catch (error) {
    console.error("Error in extractProducts:", error);
    return [];
  }
}
