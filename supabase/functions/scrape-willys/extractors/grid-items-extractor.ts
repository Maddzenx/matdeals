
// Extractor for product grid items
import { ExtractorResult, normalizeImageUrl, extractPrice } from "./base-extractor.ts";
import { extractName } from "./name-extractor.ts";

export function extractGridItems(document: Document, baseUrl: string, storeName?: string): ExtractorResult[] {
  console.log("Looking for product grid items in the HTML");
  
  const products: ExtractorResult[] = [];
  const storeNameFormatted = storeName?.toLowerCase() || 'willys';
  
  try {
    // Select grid item containers
    const gridSelectors = [
      '.product-grid', '.products-grid', '.items-grid', '.grid-container',
      '[class*="grid"]', '.product-container', '.product-listing',
      '[data-testid="products-grid"]', '[data-testid="product-listing"]',
      '.products', '.items', '.listing'
    ];
    
    // Find grid container
    let gridContainer: Element | null = null;
    
    for (const selector of gridSelectors) {
      const grid = document.querySelector(selector);
      if (grid) {
        console.log(`Found grid container with selector: ${selector}`);
        gridContainer = grid;
        break;
      }
    }
    
    // If no grid container found, try to find individual grid items directly
    if (!gridContainer) {
      console.log("No grid container found, trying to find grid items directly");
      
      const productItemSelectors = [
        '.product-item', '.grid-item', '.product-card', '.item-card',
        '[class*="product-item"]', '[class*="grid-item"]', '[class*="productItem"]',
        '[data-testid*="product"]', 'li[class*="product"]'
      ];
      
      let gridItems: NodeListOf<Element> | null = null;
      
      for (const selector of productItemSelectors) {
        const items = document.querySelectorAll(selector);
        if (items && items.length > 0) {
          console.log(`Found ${items.length} grid items with selector: ${selector}`);
          gridItems = items;
          break;
        }
      }
      
      if (!gridItems || gridItems.length === 0) {
        console.log("No grid items found");
        return [];
      }
      
      console.log(`Processing ${gridItems.length} grid items`);
      
      // Process each grid item
      for (const item of gridItems) {
        try {
          // Try to extract name using our name extractor first
          let name = extractName(item);
          
          // If name extractor failed, try alternative methods
          if (!name) {
            const nameElements = item.querySelectorAll('h1, h2, h3, h4, h5, [class*="title"], [class*="name"], b, strong');
            
            for (const el of nameElements) {
              const text = el.textContent?.trim();
              if (text && text.length > 2 && text.length < 100) {
                name = text;
                break;
              }
            }
            
            if (!name) {
              const textElements = item.querySelectorAll('p, div, span');
              for (const el of textElements) {
                const text = el.textContent?.trim();
                if (text && text.length > 2 && text.length < 50 && !text.includes('kr/') && !text.match(/^\d+[\s:,.]?\d*(\s*kr)?$/)) {
                  name = text;
                  break;
                }
              }
            }
          }
          
          if (!name) {
            console.log("Skipping item - could not find product name");
            continue;
          }
          
          console.log(`Processing grid item: ${name}`);
          
          // 2. Price
          let price = null;
          const priceElements = item.querySelectorAll('[class*="price"], [class*="Price"], .pris, .discount');
          
          for (const el of priceElements) {
            const priceText = el.textContent?.trim();
            if (priceText && priceText.match(/\d+/)) {
              const extractedPrice = extractPrice(priceText);
              if (extractedPrice !== null) {
                price = extractedPrice;
                break;
              }
            }
          }
          
          if (price === null) {
            const allText = item.textContent || '';
            const priceMatches = allText.match(/(\d+)[\s:,.]?(\d*)\s*kr/);
            
            if (priceMatches) {
              const mainNumber = parseInt(priceMatches[1]);
              const decimal = priceMatches[2] ? parseInt(priceMatches[2]) : 0;
              
              if (decimal > 0) {
                price = parseFloat(`${mainNumber}.${decimal}`);
              } else {
                price = mainNumber;
              }
            }
          }
          
          // 3. Image
          let imageUrl = '';
          const images = item.querySelectorAll('img');
          
          for (const img of images) {
            const src = img.getAttribute('src') || img.getAttribute('data-src');
            if (src && !src.includes('logo') && !src.includes('icon')) {
              imageUrl = normalizeImageUrl(src, baseUrl);
              break;
            }
          }
          
          // 4. Description
          let description = '';
          const descElements = item.querySelectorAll('[class*="desc"], [class*="info"], [class*="details"], p');
          
          for (const el of descElements) {
            const text = el.textContent?.trim();
            if (text && text !== name && text.length > 5 && !text.match(/\d+[\s:,.]?\d*\s*kr/) && !el.querySelector('img')) {
              description = text;
              break;
            }
          }
          
          // 5. Offer details
          let offerDetails = '';
          const offerElements = item.querySelectorAll('[class*="campaign"], [class*="offer"], [class*="saving"], [class*="discount"]');
          
          for (const el of offerElements) {
            const text = el.textContent?.trim();
            if (text && text.length > 2 && text !== name && text !== description) {
              offerDetails = text;
              break;
            }
          }
          
          if (!offerDetails) {
            offerDetails = 'Veckans erbjudande';
          }
          
          // Add product to list
          if (name && price !== null) {
            products.push({
              name,
              price,
              description: description || null,
              image_url: imageUrl || 'https://assets.icanet.se/t_product_large_v1,f_auto/7300156501245.jpg',
              offer_details: offerDetails,
              store: storeNameFormatted
            });
            
            console.log(`Added grid item: ${name}, price: ${price}`);
          }
        } catch (itemError) {
          console.error("Error processing grid item:", itemError);
        }
      }
    }
    
    console.log(`Successfully extracted ${products.length} grid items`);
    return products;
  } catch (error) {
    console.error("Error extracting grid items:", error);
    return [];
  }
}
