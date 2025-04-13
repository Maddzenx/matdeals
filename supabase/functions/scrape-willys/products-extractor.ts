
import { extractProductsFromGrid } from "./extractors/grid-items-extractor.ts";
import { extractProductsFromWeeklyOffers } from "./extractors/weekly-offers-extractor.ts";
import { fallbackGenericExtractor } from "./extractors/generic-extractor.ts";
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
    products = extractProductsFromGrid(document);
    
    // If that didn't work, try the weekly offers extractor
    if (products.length === 0) {
      console.log("Grid extractor found no products, trying weekly offers extractor...");
      products = extractProductsFromWeeklyOffers(document);
    }
    
    // If we still have no products, try the fallback extractor
    if (products.length === 0) {
      console.log("Weekly offers extractor found no products, trying fallback extractor...");
      products = fallbackGenericExtractor(document);
    }
    
    console.log(`Total extracted products: ${products.length}`);
    return products;
    
  } catch (error) {
    console.error("Error extracting products:", error);
    return [];
  }
}
