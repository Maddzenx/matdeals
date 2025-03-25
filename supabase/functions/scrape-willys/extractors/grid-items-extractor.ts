
import { ExtractorResult, normalizeImageUrl, extractPrice } from "./base-extractor.ts";
import { extractName } from "./name-extractor.ts";
import { extractOfferDetails } from "./offer-details-extractor.ts";

/**
 * Extract products from the grid items on the page
 */
export function extractGridItems(document: Document, baseUrl: string): ExtractorResult[] {
  console.log("Looking for product grid items in the HTML");
  
  try {
    // Find grid containers for products
    const gridSelectors = [
      '.product-grid', '.grid', '.products-grid',
      '[class*="productGrid"]', '[class*="productList"]',
      'section div[class*="grid"]'
    ];
    
    // Find all potential grid containers
    let gridContainer: Element | null = null;
    
    for (const selector of gridSelectors) {
      const container = document.querySelector(selector);
      if (container) {
        console.log(`Found grid container with selector: ${selector}`);
        gridContainer = container;
        break;
      }
    }
    
    if (!gridContainer) {
      console.log("No grid container found, trying to find individual product items directly");
      
      // Try to find product items directly
      const products: ExtractorResult[] = [];
      const allProductItems = document.querySelectorAll('[class*="product"], article, .card, .item, li');
      
      console.log(`Found ${allProductItems.length} potential product items`);
      
      for (const item of allProductItems) {
        // Check if this element contains product information
        if (isProductElement(item)) {
          try {
            const name = extractName(item);
            if (!name) continue;
            
            // Extract price from text - ensure it's an integer
            let price: number | null = null;
            const priceText = item.textContent || '';
            const priceMatch = priceText.match(/(\d+)[,.:]*(\d*)\s*kr/);
            
            if (priceMatch) {
              const mainDigits = parseInt(priceMatch[1]);
              const decimalPart = priceMatch[2] ? parseInt(priceMatch[2]) : 0;
              
              // Convert to appropriate format (integer)
              if (decimalPart > 0) {
                // Round to nearest integer if there's a decimal part
                price = Math.round(parseFloat(`${mainDigits}.${decimalPart}`));
              } else {
                price = mainDigits;
              }
            }
            
            if (!price) continue;
            
            // Get image
            let imageUrl = '';
            const image = item.querySelector('img');
            if (image) {
              const src = image.getAttribute('src') || image.getAttribute('data-src');
              if (src) {
                imageUrl = normalizeImageUrl(src, baseUrl);
              }
            }
            
            const description = item.querySelector('p, [class*="desc"]')?.textContent?.trim() || null;
            const offerDetails = extractOfferDetails(item);
            
            products.push({
              name,
              price,
              description,
              image_url: imageUrl,
              offer_details: offerDetails,
              store: 'willys'
            });
            
            console.log(`Added grid product: ${name}, price: ${price}`);
          } catch (itemError) {
            console.error("Error processing a potential product item:", itemError);
          }
        }
      }
      
      console.log(`Extracted ${products.length} products from direct product items`);
      return products;
    }
    
    // Find all product items within the grid
    const productItemSelectors = [
      '.product-item', '.product', '.offer-item', 'article', 
      '[class*="productCard"]', '[class*="card"]', 'li', '.item'
    ];
    
    let productItems: NodeListOf<Element> | null = null;
    
    for (const selector of productItemSelectors) {
      const items = gridContainer.querySelectorAll(selector);
      if (items && items.length > 0) {
        console.log(`Found ${items.length} product items with selector: ${selector}`);
        productItems = items;
        break;
      }
    }
    
    if (!productItems || productItems.length === 0) {
      console.log("No product items found in grid container");
      return [];
    }
    
    // Process each product item
    const products: ExtractorResult[] = [];
    
    for (const item of productItems) {
      try {
        const name = extractName(item);
        if (!name) continue;
        
        // Extract price making sure it's an integer
        let price: number | null = null;
        const priceElements = item.querySelectorAll('[class*="price"], .pris, .amount');
        
        for (const el of priceElements) {
          const priceText = el.textContent?.trim();
          if (priceText && priceText.match(/\d+/)) {
            const extractedPrice = extractPrice(priceText);
            if (extractedPrice !== null) {
              // Ensure it's an integer
              price = Math.round(extractedPrice);
              break;
            }
          }
        }
        
        // If no price found in dedicated elements, try to find it in the general text
        if (price === null) {
          const allText = item.textContent || '';
          const priceMatch = allText.match(/(\d+)[,.:]*(\d*)\s*kr/);
          
          if (priceMatch) {
            const mainDigits = parseInt(priceMatch[1]);
            const decimalPart = priceMatch[2] ? parseInt(priceMatch[2]) : 0;
            
            // Convert to appropriate format (integer)
            if (decimalPart > 0) {
              // Round to nearest integer if there's a decimal part
              price = Math.round(parseFloat(`${mainDigits}.${decimalPart}`));
            } else {
              price = mainDigits;
            }
          }
        }
        
        if (!price) continue;
        
        // Find image
        let imageUrl = '';
        const image = item.querySelector('img');
        if (image) {
          const src = image.getAttribute('src') || image.getAttribute('data-src');
          if (src) {
            imageUrl = normalizeImageUrl(src, baseUrl);
          }
        }
        
        // Description
        const description = item.querySelector('p, [class*="desc"]')?.textContent?.trim() || null;
        const offerDetails = extractOfferDetails(item);
        
        products.push({
          name,
          price,
          description,
          image_url: imageUrl,
          offer_details: offerDetails,
          store: 'willys'
        });
        
        console.log(`Added grid product: ${name}, price: ${price}`);
      } catch (itemError) {
        console.error("Error processing a product item:", itemError);
      }
    }
    
    console.log(`Extracted ${products.length} products from grid items`);
    return products;
  } catch (error) {
    console.error("Error extracting grid products:", error);
    return [];
  }
}

/**
 * Determine if an element is likely a product card
 */
function isProductElement(element: Element): boolean {
  // Check if the element contains product indicators
  const text = element.textContent?.toLowerCase() || '';
  const hasPrice = text.includes('kr') || text.includes(':-)') || text.includes('pris');
  const hasProductName = element.querySelector('h2, h3, h4, h5, .title, [class*="name"]');
  const hasImage = element.querySelector('img');
  
  // Score based on product indicators
  let score = 0;
  if (hasPrice) score += 2;
  if (hasProductName) score += 2;
  if (hasImage) score += 1;
  
  return score >= 3;
}
