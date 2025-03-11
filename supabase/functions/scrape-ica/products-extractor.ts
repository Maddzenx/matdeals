
import { Product } from "./types/product.ts";
import { processProductCard } from "./processors/card-processor.ts";

/**
 * Extracts all products from the provided offer cards
 */
export function extractProducts(offerCards: Element[], baseUrl: string): Product[] {
  const products: Product[] = [];
  const processedProductNames = new Set<string>();
  
  for (const card of offerCards) {
    const product = processProductCard(card, baseUrl, processedProductNames);
    if (product) {
      products.push(product);
    }
  }
  
  console.log(`Successfully processed ${products.length} products out of ${offerCards.length} elements`);
  
  if (products.length === 0) {
    console.error("No products were found. HTML structure might have changed.");
    throw new Error("No products found on the page. The website structure may have changed.");
  }
  
  return products;
}
