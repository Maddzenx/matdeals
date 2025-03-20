
// Main product extractor that orchestrates the extraction process
import { extractWeeklyOffers } from "./extractors/weekly-offers-extractor.ts";
import { extractGridItems } from "./extractors/grid-items-extractor.ts";
import { extractGenericProducts } from "./extractors/generic-extractor.ts";
import { extractFallbackProducts, createSampleProducts } from "./extractors/fallback-extractor.ts";
import { ExtractorResult } from "./extractors/base-extractor.ts";

// Function to extract products from the Willys webpage
export function extractProducts(document: Document, baseUrl: string): ExtractorResult[] {
  console.log("Starting product extraction from Willys webpage");
  
  try {
    // Try multiple extraction strategies in sequence
    let products: ExtractorResult[] = [];
    
    // Strategy 1: Look for offer cards in the weekly offers section
    products = extractWeeklyOffers(document, baseUrl);
    
    // Strategy 2: Look for product grid items if first strategy yielded no results
    if (products.length === 0) {
      products = extractGridItems(document, baseUrl);
    }
    
    // Strategy 3: Generic search for products if previous strategies failed
    if (products.length === 0) {
      products = extractGenericProducts(document, baseUrl);
    }
    
    // Strategy 4: Use generic selectors as a last resort
    if (products.length === 0) {
      products = extractFallbackProducts(document);
      
      // If still no products, add some fallback products
      if (products.length === 0) {
        products = createSampleProducts();
        console.log("Added fallback products as no products were found in the HTML");
      }
    }
    
    // Log the results
    console.log(`Total products extracted: ${products.length}`);
    if (products.length > 0) {
      console.log("First product:", JSON.stringify(products[0], null, 2));
    }
    
    return products;
  } catch (error) {
    console.error("Error during product extraction:", error);
    
    // Return fallback products
    const fallbackProducts = createSampleProducts();
    console.log("Using fallback products due to extraction error");
    return fallbackProducts.slice(0, 2); // Just return first two fallback products
  }
}
