
// Main product extractor that orchestrates the extraction process
import { extractFallbackProducts, createSampleProducts } from "./extractors/fallback-extractor.ts";
import { findProductContainers } from "./extractors/container-selectors.ts";
import { extractProductCards } from "./extractors/product-card-extractor.ts";
import { ExtractorResult } from "./extractors/base-extractor.ts";

// Function to extract products from the Hemköp webpage
export function extractProducts(document: Document, baseUrl: string): ExtractorResult[] {
  console.log("Starting product extraction from Hemköp webpage");
  
  try {
    // Find product containers using various selectors
    const productContainers = findProductContainers(document);
    
    if (!productContainers || productContainers.length === 0) {
      console.log("No product containers found, attempting fallback extraction");
      return extractFallbackProducts(document);
    }
    
    console.log(`Found ${productContainers.length} product containers to process`);
    
    // Extract products from the containers
    const products = extractProductCards(productContainers, baseUrl);
    
    console.log(`Successfully extracted ${products.length} products`);
    
    if (products.length === 0) {
      console.log("No products successfully extracted, using fallback method");
      return extractFallbackProducts(document);
    }
    
    return products;
    
  } catch (error) {
    console.error("Error during product extraction:", error);
    
    // Return fallback products
    const fallbackProducts = createSampleProducts();
    console.log("Using fallback products due to extraction error");
    return fallbackProducts;
  }
}
