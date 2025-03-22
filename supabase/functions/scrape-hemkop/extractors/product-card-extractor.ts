
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
  
  for (let i = 0; i < productContainers.length; i++) {
    const container = productContainers[i];
    try {
      console.log(`\nProcessing product container ${i + 1}/${productContainers.length}`);
      
      // Extract name using specialized extractor
      const name = extractName(container);
      
      if (!name) {
        console.log("Skipping item - no valid name found");
        continue;
      }
      
      // Skip items with very short names or duplicates
      if (name.length < 3) {
        console.log(`Skipping item with too short name: "${name}"`);
        continue;
      }
      
      if (processedNames.has(name.toLowerCase())) {
        console.log(`Skipping duplicate product: "${name}"`);
        continue;
      }
      
      // Use specialized extractors to get product data
      const price = extractPrice(container);
      if (!price) {
        console.log(`Skipping product "${name}" - no valid price found`);
        continue;
      }
      
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
      
      console.log(`Successfully extracted product: ${name}, price: ${price}, description: ${description?.substring(0, 30) || 'none'}`);
      
    } catch (itemError) {
      console.error("Error extracting product data:", itemError);
    }
  }
  
  console.log(`\nSuccessfully extracted ${products.length} products from ${productContainers.length} containers`);
  return products;
}
