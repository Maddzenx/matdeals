
import { processProductCard } from "./processors/card-processor.ts";

/**
 * Extracts products from the document using various extraction methods
 */
export function extractProducts(document: Document, baseUrl: string) {
  console.log("Starting product extraction with multiple strategies...");
  
  // Try multiple extraction strategies to increase success rate
  const products = [
    ...extractByClassicSelectors(document, baseUrl),
    ...extractByDataAttributes(document, baseUrl),
    ...extractByArticleElements(document, baseUrl),
    ...extractByImageAndPriceProximity(document, baseUrl),
  ];
  
  // Remove duplicates based on name
  const uniqueProducts = removeDuplicates(products);
  
  console.log(`Successfully extracted ${uniqueProducts.length} unique products after trying multiple strategies`);
  return uniqueProducts;
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
