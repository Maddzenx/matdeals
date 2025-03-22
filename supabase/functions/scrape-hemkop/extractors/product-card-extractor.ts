
import { ExtractorResult } from "./base-extractor.ts";

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
      // Extract name - try multiple selectors for product name
      const nameSelectors = ['h2', 'h3', 'h4', '.title', '[class*="title"]', '[class*="name"]', 
                           '.product-title', '.offer-title', '.product-name', '.item-name'];
      let name = '';
      
      for (const selector of nameSelectors) {
        const nameElement = container.querySelector(selector);
        if (nameElement && nameElement.textContent) {
          name = nameElement.textContent.trim();
          if (name.length > 2) break;
        }
      }
      
      // If no name found with selectors, try to find any text that looks like a product name
      if (!name || name.length < 3) {
        const textNodes = Array.from(container.querySelectorAll('*'))
          .filter(el => el.textContent && 
                      el.textContent.trim().length > 3 && 
                      !el.textContent.match(/\d+[,.:]?\d*\s*kr/));
        
        if (textNodes.length > 0) {
          name = textNodes[0].textContent?.trim() || '';
        }
      }
      
      // Skip items with no name or duplicates
      if (!name || name.length < 3 || processedNames.has(name.toLowerCase())) continue;
      
      // Extract price
      const price = extractPrice(container);
      
      // Extract image
      const imageUrl = extractImage(container, baseUrl);
      
      // Extract description
      const description = extractDescription(container);
      
      // Extract offer details
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

/**
 * Extracts price from a product container
 */
function extractPrice(container: Element): number | null {
  const priceSelectors = ['.price', '[class*="price"]', '.product-price', '.offer-price', 
                        '[class*="Price"]', '[class*="pris"]', 'strong'];
  let priceText = '';
  
  // First try with specific selectors
  for (const selector of priceSelectors) {
    const priceElement = container.querySelector(selector);
    if (priceElement) {
      priceText = priceElement.textContent?.trim() || '';
      break;
    }
  }
  
  // If no price found with selectors, look for text that matches price pattern
  if (!priceText) {
    const allText = container.textContent || '';
    const priceMatch = allText.match(/(\d+)[,.:]?(\d*)\s*kr/i);
    if (priceMatch) {
      priceText = priceMatch[0];
    }
  }
  
  // Extract numeric price value
  if (priceText) {
    const priceMatch = priceText.match(/(\d+)[,.:]?(\d*)/);
    
    if (priceMatch) {
      const wholePart = parseInt(priceMatch[1]);
      
      // If we have decimal part
      if (priceMatch[2] && priceMatch[2].length > 0) {
        const decimalPart = parseInt(priceMatch[2]);
        return decimalPart > 0 ? parseFloat(`${wholePart}.${decimalPart}`) : wholePart;
      } else {
        return wholePart;
      }
    }
  }
  
  return null;
}

/**
 * Extracts image URL from a product container
 */
function extractImage(container: Element, baseUrl: string): string {
  const defaultImage = 'https://assets.icanet.se/t_product_large_v1,f_auto/7300156501245.jpg';
  
  const imgElement = container.querySelector('img');
  if (!imgElement) return defaultImage;
  
  const src = imgElement.getAttribute('src') || 
            imgElement.getAttribute('data-src') || 
            imgElement.getAttribute('srcset')?.split(' ')[0];
  
  if (!src) return defaultImage;
  
  return src.startsWith('http') ? 
    src : 
    src.startsWith('//') ? 
      `https:${src}` : 
      `${baseUrl}${src.startsWith('/') ? '' : '/'}${src}`;
}

/**
 * Extracts description from a product container
 */
function extractDescription(container: Element): string | null {
  const descSelectors = ['.description', '[class*="desc"]', '.product-description', 
                       '.subtitle', '.info', '.details', '.product-info', '.meta'];
  
  for (const selector of descSelectors) {
    const descElement = container.querySelector(selector);
    if (descElement) {
      const description = descElement.textContent?.trim() || null;
      if (description) return description;
    }
  }
  
  return null;
}

/**
 * Extracts offer details from a product container
 */
function extractOfferDetails(container: Element): string {
  const offerSelectors = ['.offer-badge', '.discount', '.promo', '[class*="badge"]', 
                         '.campaign-text', '.save-text', '.price-tag'];
  const defaultOffer = 'Erbjudande';
  
  for (const selector of offerSelectors) {
    const offerElement = container.querySelector(selector);
    if (offerElement) {
      const offerText = offerElement.textContent?.trim();
      if (offerText && offerText.length > 0) {
        return offerText;
      }
    }
  }
  
  return defaultOffer;
}
