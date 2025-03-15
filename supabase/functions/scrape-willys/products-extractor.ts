
import { processProductCard } from "./processors/card-processor.ts";

/**
 * Extracts products from the document
 */
export function extractProducts(document: Document, baseUrl: string) {
  console.log("Starting product extraction...");
  
  // Find all product elements using various selectors to increase chances of finding products
  const productElements = [
    ...document.querySelectorAll('.product-list-item'),
    ...document.querySelectorAll('.product-tile'),
    ...document.querySelectorAll('.offer-card'),
    ...document.querySelectorAll('.product-card'),
    ...document.querySelectorAll('.product'),
    ...document.querySelectorAll('[class*="product-"]'),
    ...document.querySelectorAll('[class*="offer-"]'),
    ...document.querySelectorAll('[data-test="product"]'),
    ...document.querySelectorAll('article')
  ];
  
  console.log(`Found ${productElements.length} potential product elements`);
  
  // Deduplicate product names to prevent duplicates
  const processedProductNames = new Set<string>();
  const products = [];
  
  // Process each product element
  for (const element of productElements) {
    try {
      // Extract product info from the element
      const product = processProductCard(element, baseUrl, processedProductNames);
      
      if (product && product.name) {
        products.push(product);
      }
    } catch (error) {
      console.error("Error processing product element:", error);
      // Continue to next element
    }
  }
  
  console.log(`Successfully extracted ${products.length} products`);
  return products;
}
