import { processProductCard } from "./processors/card-processor.ts";

/**
 * Extracts products from the document using various extraction methods
 */
export function extractProducts(document: Document, baseUrl: string) {
  console.log("Starting product extraction with multiple strategies...");
  
  // Try multiple extraction strategies to increase success rate
  const products = [
    ...extractByDynamicPatterns(document, baseUrl),
    ...extractByClassicSelectors(document, baseUrl),
    ...extractByDataAttributes(document, baseUrl),
    ...extractByArticleElements(document, baseUrl),
    ...extractByImageAndPriceProximity(document, baseUrl),
    ...extractFromSearchResults(document, baseUrl),  // New method
    ...extractFromOfferElements(document, baseUrl),  // New method
  ];
  
  // Remove duplicates based on name
  const uniqueProducts = removeDuplicates(products);
  
  console.log(`Extracted ${uniqueProducts.length} unique products after trying multiple strategies`);
  return uniqueProducts;
}

// Strategy 0: Extracting by analyzing DOM patterns
function extractByDynamicPatterns(document: Document, baseUrl: string) {
  console.log("Strategy 0: Extracting by analyzing DOM patterns");
  
  // Look for grids and lists which often contain products
  const grids = [
    ...document.querySelectorAll('[class*="grid"]'),
    ...document.querySelectorAll('[class*="list"]'),
    ...document.querySelectorAll('[class*="products"]'),
    ...document.querySelectorAll('ul li'),
    ...document.querySelectorAll('div > div > div'), // Nested divs often make up product grids
  ];
  
  // Look for elements with multiple similar children - often product listings
  const repeatingPatterns = [];
  
  for (const grid of grids) {
    // Skip tiny grids
    if (!grid.children || grid.children.length < 2) continue;
    
    // Check if children have similar structure (similar number of images, text nodes, etc)
    const childElements = Array.from(grid.children);
    
    // Check first few children to see if they're similar
    const similarChildren = [];
    
    for (let i = 0; i < Math.min(childElements.length, 5); i++) {
      const child = childElements[i];
      
      // Looking for product-like characteristics
      const hasImage = child.querySelector('img') !== null;
      const hasText = (child.textContent || '').trim().length > 0;
      const hasPricePattern = /\d+[,.:]\d+\s*(kr|:-)/i.test(child.textContent || '') || 
                              /\d+\s*(kr|:-)/i.test(child.textContent || '');
      
      // Only include as potential product if it has basic product attributes
      if (hasImage && hasText && hasPricePattern) {
        similarChildren.push(child);
      }
    }
    
    if (similarChildren.length >= 2) {
      // This grid likely contains products
      repeatingPatterns.push(...childElements);
    }
  }
  
  console.log(`Found ${repeatingPatterns.length} elements in potential product patterns`);
  
  const processedProductNames = new Set<string>();
  const products = [];
  
  for (const element of repeatingPatterns) {
    try {
      const product = processProductCard(element, baseUrl, processedProductNames);
      if (product && product.name) {
        products.push(product);
      }
    } catch (error) {
      // Just continue to next element
    }
  }
  
  console.log(`Extracted ${products.length} products using dynamic pattern analysis`);
  return products;
}

// Strategy 1: Extract by classic product class names and selectors
function extractByClassicSelectors(document: Document, baseUrl: string) {
  console.log("Strategy 1: Extracting by classic product selectors");
  
  const productElements = [
    ...document.querySelectorAll('.product-list-item'),
    ...document.querySelectorAll('.product-tile'),
    ...document.querySelectorAll('.offer-card'),
    ...document.querySelectorAll('.product-card'),
    ...document.querySelectorAll('.product'),
    ...document.querySelectorAll('[class*="product-"]'),
    ...document.querySelectorAll('[class*="offer-"]'),
    ...document.querySelectorAll('[class*="campaign-"]'),
    ...document.querySelectorAll('[class*="item-"]'),
    ...document.querySelectorAll('[id*="product"]'),
  ];
  
  console.log(`Found ${productElements.length} potential product elements with classic selectors`);
  
  const processedProductNames = new Set<string>();
  const products = [];
  
  for (const element of productElements) {
    try {
      const product = processProductCard(element, baseUrl, processedProductNames);
      if (product && product.name) {
        products.push(product);
      }
    } catch (error) {
      // Just continue to next element
    }
  }
  
  console.log(`Extracted ${products.length} products using classic selectors`);
  return products;
}

// Strategy 2: Extract by data attributes that might indicate products
function extractByDataAttributes(document: Document, baseUrl: string) {
  console.log("Strategy 2: Extracting by data attributes");
  
  const productElements = [
    ...document.querySelectorAll('[data-test*="product"]'),
    ...document.querySelectorAll('[data-id*="product"]'),
    ...document.querySelectorAll('[data-product-id]'),
    ...document.querySelectorAll('[data-item-id]'),
    ...document.querySelectorAll('[data-sku]'),
    ...document.querySelectorAll('[data-test*="offer"]'),
    ...document.querySelectorAll('[data-test*="item"]'),
    ...document.querySelectorAll('[data-testid*="product"]'),
    ...document.querySelectorAll('[data-testid*="offer"]'),
  ];
  
  console.log(`Found ${productElements.length} potential product elements with data attributes`);
  
  const processedProductNames = new Set<string>();
  const products = [];
  
  for (const element of productElements) {
    try {
      const product = processProductCard(element, baseUrl, processedProductNames);
      if (product && product.name) {
        products.push(product);
      }
    } catch (error) {
      // Just continue to next element
    }
  }
  
  console.log(`Extracted ${products.length} products using data attributes`);
  return products;
}

// Strategy 3: Extract by article elements which often represent products
function extractByArticleElements(document: Document, baseUrl: string) {
  console.log("Strategy 3: Extracting by article elements");
  
  const articleElements = document.querySelectorAll('article');
  console.log(`Found ${articleElements.length} article elements`);
  
  const processedProductNames = new Set<string>();
  const products = [];
  
  for (const element of articleElements) {
    try {
      const product = processProductCard(element, baseUrl, processedProductNames);
      if (product && product.name) {
        products.push(product);
      }
    } catch (error) {
      // Just continue to next element
    }
  }
  
  console.log(`Extracted ${products.length} products from article elements`);
  return products;
}

// Strategy 4: Look for elements with both images and price-like text nearby
function extractByImageAndPriceProximity(document: Document, baseUrl: string) {
  console.log("Strategy 4: Extracting by image and price proximity");
  
  const products = [];
  const processedProductNames = new Set<string>();
  
  // Find all images that might be product images
  const productImages = document.querySelectorAll('img');
  console.log(`Found ${productImages.length} images to analyze`);
  
  for (const img of productImages) {
    try {
      // Check parent elements up to 3 levels for price-like content
      let element: Element | null = img;
      for (let i = 0; i < 3 && element; i++) {
        element = element.parentElement;
        if (!element) continue;
        
        // Look for price-like text in this container
        const text = element.textContent || '';
        const hasPriceLikeText = /\d+[,.:]\d+\s*(kr|:-)/i.test(text) || /\d+\s*(kr|:-)/i.test(text);
        
        if (hasPriceLikeText) {
          // This might be a product container
          const product = processProductCard(element, baseUrl, processedProductNames);
          if (product && product.name) {
            products.push(product);
            break; // Found a product, no need to check higher parent elements
          }
        }
      }
    } catch (error) {
      // Just continue to next element
    }
  }
  
  console.log(`Extracted ${products.length} products using image and price proximity`);
  return products;
}

// Strategy 5: Extract from search results layout
function extractFromSearchResults(document: Document, baseUrl: string) {
  console.log("Strategy 5: Extracting from search results layout");
  
  const searchResultsElements = [
    ...document.querySelectorAll('[data-testid*="product-search-result"]'),
    ...document.querySelectorAll('[data-testid*="search-result"]'),
    ...document.querySelectorAll('[class*="search-result"]'),
    ...document.querySelectorAll('[class*="product-list"]'),
    ...document.querySelectorAll('[class*="result-item"]'),
  ];
  
  console.log(`Found ${searchResultsElements.length} potential search result elements`);
  
  const processedProductNames = new Set<string>();
  const products = [];
  
  for (const element of searchResultsElements) {
    try {
      const product = processProductCard(element, baseUrl, processedProductNames);
      if (product && product.name) {
        products.push(product);
      }
    } catch (error) {
      // Just continue to next element
    }
  }
  
  console.log(`Extracted ${products.length} products from search results`);
  return products;
}

// Strategy 6: Extract from offer elements
function extractFromOfferElements(document: Document, baseUrl: string) {
  console.log("Strategy 6: Extracting from offer elements");
  
  // Look for elements that might indicate offers
  const offerElements = [
    ...document.querySelectorAll('[class*="offer"]'),
    ...document.querySelectorAll('[class*="campaign"]'),
    ...document.querySelectorAll('[class*="deal"]'),
    ...document.querySelectorAll('[class*="promotion"]'),
    ...document.querySelectorAll('[class*="discount"]'),
    ...document.querySelectorAll('[data-testid*="offer"]'),
    ...document.querySelectorAll('[data-testid*="campaign"]'),
  ];
  
  console.log(`Found ${offerElements.length} potential offer elements`);
  
  // Extract direct products from offer elements
  const processedProductNames = new Set<string>();
  const products = [];
  
  for (const element of offerElements) {
    try {
      // Try to process the element directly
      const product = processProductCard(element, baseUrl, processedProductNames);
      if (product && product.name) {
        products.push(product);
        continue;
      }
      
      // If direct processing failed, look for child elements that might be products
      const childElements = element.querySelectorAll('div, article, li');
      for (const child of childElements) {
        const childProduct = processProductCard(child, baseUrl, processedProductNames);
        if (childProduct && childProduct.name) {
          products.push(childProduct);
        }
      }
    } catch (error) {
      // Just continue to next element
    }
  }
  
  console.log(`Extracted ${products.length} products from offer elements`);
  return products;
}

// Helper function to remove duplicate products
function removeDuplicates(products: any[]) {
  const uniqueProducts: any[] = [];
  const seenNames = new Set<string>();
  
  for (const product of products) {
    if (!product.name) continue;
    
    const normalizedName = product.name.toLowerCase().trim();
    if (!seenNames.has(normalizedName)) {
      seenNames.add(normalizedName);
      uniqueProducts.push(product);
    }
  }
  
  return uniqueProducts;
}
