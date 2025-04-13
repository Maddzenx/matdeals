
import { extractGridItems } from "./extractors/grid-items-extractor.ts";
import { extractFromWeeklyOffers } from "./extractors/weekly-offers-extractor.ts";
import { ExtractorResult } from "./types.ts";

/**
 * Extract products from HTML
 * @param docOrHtml Document or HTML string
 * @returns Array of extracted products
 */
export function extractProductsFromHTML(docOrHtml: Document | string): ExtractorResult[] {
  console.log("Starting product extraction");
  
  // If given a string, we need to parse it first
  const inputIsString = typeof docOrHtml === 'string';
  
  let document: Document;
  if (inputIsString) {
    console.log("Input is a string, parsing HTML...");
    // We need to import DOMParser here to handle string input
    const { DOMParser } = require("https://deno.land/x/deno_dom/deno-dom-wasm.ts");
    const parser = new DOMParser();
    document = parser.parseFromString(docOrHtml as string, "text/html");
  } else {
    document = docOrHtml as Document;
  }
  
  if (!document) {
    console.error("Failed to parse HTML document");
    return [];
  }
  
  let products: ExtractorResult[] = [];
  
  try {
    // Try the grid extractor first (for normal product listings)
    console.log("Trying grid extractor...");
    products = extractGridItems(document, "https://www.willys.se");
    
    // If that didn't work, try the weekly offers extractor
    if (products.length === 0) {
      console.log("Grid extractor found no products, trying weekly offers extractor...");
      products = extractFromWeeklyOffers(document, "https://www.willys.se");
    }
    
    // If we still have no products, use fallback
    if (products.length === 0) {
      console.log("All extractors failed to find products");
      return [];
    }
    
    console.log(`Total extracted products: ${products.length}`);
    return products;
    
  } catch (error) {
    console.error("Error extracting products:", error);
    return [];
  }
}

// Create a fallback extractor function
export function fallbackGenericExtractor(document: Document): ExtractorResult[] {
  console.log("Using fallback generic extractor");
  return []; // Return empty array as fallback
}

// Add a compatibility function for the old API
export function extractProducts(html: string, store: string = "willys", location: string = "johanneberg"): ExtractorResult[] {
  const products = extractProductsFromHTML(html);
  
  // Add store and location to all products
  return products.map(product => ({
    ...product,
    store,
    store_location: location
  }));
}
