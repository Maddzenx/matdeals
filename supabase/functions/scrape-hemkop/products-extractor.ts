
// Main product extractor that orchestrates the extraction process
import { extractFallbackProducts, createSampleProducts } from "./extractors/fallback-extractor.ts";
import { ExtractorResult } from "./extractors/base-extractor.ts";

// Function to extract products from the Hemköp webpage
export function extractProducts(document: Document, baseUrl: string): ExtractorResult[] {
  console.log("Starting product extraction from Hemköp webpage");
  
  try {
    // Try multiple different selectors to find product elements
    const selectors = [
      '.product-card', '.offer-card', '.product-item', '[class*="product"]', 
      '[class*="offer"]', '.campaign-item', '.goods-item', '.discount-item',
      'article', '.item[data-price]', '.js-product-card'
    ];
    
    let productContainers: NodeListOf<Element> | null = null;
    
    // Try each selector until we find product containers
    for (const selector of selectors) {
      const containers = document.querySelectorAll(selector);
      console.log(`Selector '${selector}' found ${containers.length} elements`);
      
      if (containers.length > 0) {
        productContainers = containers;
        break;
      }
    }
    
    // If no containers found with specific selectors, try a more generic approach
    if (!productContainers || productContainers.length === 0) {
      console.log("No specific product containers found, trying generic approach");
      
      // Look for elements that have both image and price-like content
      const potentialContainers = Array.from(document.querySelectorAll('div, article, section, li'))
        .filter(el => {
          const hasImg = el.querySelector('img') !== null;
          const hasPriceText = el.textContent?.match(/\d+[,.:]?\d*\s*kr/) !== null;
          return hasImg && hasPriceText;
        });
      
      console.log(`Found ${potentialContainers.length} potential containers with generic approach`);
      
      if (potentialContainers.length > 0) {
        productContainers = potentialContainers as unknown as NodeListOf<Element>;
      }
    }
    
    if (!productContainers || productContainers.length === 0) {
      console.log("No product containers found, attempting fallback extraction");
      return extractFallbackProducts(document);
    }
    
    console.log(`Found ${productContainers.length} product containers to process`);
    
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
          // Look for any non-price text content that's likely to be a name
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
        
        // Extract price - try to find price text using various methods
        const priceSelectors = ['.price', '[class*="price"]', '.product-price', '.offer-price', 
                              '[class*="Price"]', '[class*="pris"]', 'strong'];
        let price: number | null = null;
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
              price = decimalPart > 0 ? parseFloat(`${wholePart}.${decimalPart}`) : wholePart;
            } else {
              price = wholePart;
            }
          }
        }
        
        // Extract image
        const imgElement = container.querySelector('img');
        let imageUrl = 'https://assets.icanet.se/t_product_large_v1,f_auto/7300156501245.jpg'; // default
        
        if (imgElement) {
          const src = imgElement.getAttribute('src') || 
                    imgElement.getAttribute('data-src') || 
                    imgElement.getAttribute('srcset')?.split(' ')[0];
          
          if (src) {
            imageUrl = src.startsWith('http') ? 
              src : 
              src.startsWith('//') ? 
                `https:${src}` : 
                `${baseUrl}${src.startsWith('/') ? '' : '/'}${src}`;
          }
        }
        
        // Extract description
        const descSelectors = ['.description', '[class*="desc"]', '.product-description', 
                             '.subtitle', '.info', '.details', '.product-info', '.meta'];
        let description = null;
        
        for (const selector of descSelectors) {
          const descElement = container.querySelector(selector);
          if (descElement) {
            description = descElement.textContent?.trim() || null;
            if (description) break;
          }
        }
        
        // Extract offer details
        const offerSelectors = ['.offer-badge', '.discount', '.promo', '[class*="badge"]', 
                               '.campaign-text', '.save-text', '.price-tag'];
        let offerDetails = 'Erbjudande'; // Default text
        
        for (const selector of offerSelectors) {
          const offerElement = container.querySelector(selector);
          if (offerElement) {
            const offerText = offerElement.textContent?.trim();
            if (offerText && offerText.length > 0) {
              offerDetails = offerText;
              break;
            }
          }
        }
        
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
