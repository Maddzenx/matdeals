
import { ExtractorResult } from "./base-extractor.ts";
import { extractName } from "./name-extractor.ts";
import { extractPrice } from "./price-extractor.ts";
import { extractImage } from "./image-extractor.ts";
import { extractDescription } from "./description-extractor.ts";
import { extractOfferDetails } from "./offer-details-extractor.ts";

/**
 * Extracts products from individual product cards on the page
 */
export function extractProductCards(
  productContainers: NodeListOf<Element> | Element[], 
  baseUrl: string
): ExtractorResult[] {
  console.log(`Processing ${productContainers.length} product containers`);
  
  const products: ExtractorResult[] = [];
  const processedNames = new Set<string>();
  
  for (const container of productContainers) {
    try {
      // Extract name using specialized extractor
      const name = extractName(container);
      
      // Skip items with no name or duplicates
      if (!name || name.length < 3 || processedNames.has(name.toLowerCase())) continue;
      
      // Use specialized extractors to get product data
      const price = extractPrice(container);
      const imageUrl = extractImage(container, baseUrl);
      const description = extractDescription(container);
      const offerDetails = extractOfferDetails(container);
      
      // Add to processed names to avoid duplicates
      processedNames.add(name.toLowerCase());
      
      // Add product to list
      products.push({
        name,
        price,
        description,
        image_url: imageUrl,
        offer_details: offerDetails
      });
      
      console.log(`Extracted product: ${name}, price: ${price}, image: ${imageUrl.substring(0, 30)}...`);
      
    } catch (itemError) {
      console.error("Error extracting product data:", itemError);
    }
  }
  
  return products;
}
