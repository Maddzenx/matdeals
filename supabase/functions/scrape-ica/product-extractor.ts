
/**
 * Types for product data
 */
export interface Product {
  name: string;
  description: string | null;
  price: number | null;
  image_url: string | null;
}

/**
 * Extracts product name from a card element using multiple selectors
 */
export function extractProductName(card: Element): string | null {
  const nameSelectors = [
    'p.offer-card__title', '.offer-card-v3__title', '.product-card__product-name', 
    '.promotion-item__title', 'h2', 'h3', '.title', '[class*="title"]',
    '[class*="name"]', '.offer-card__heading', '.product__title', '.item__title',
    'p.title', 'p.heading', 'div.title', 'div.heading', 'span.title', 'span.heading'
  ];
  
  // Try each selector
  for (const selector of nameSelectors) {
    const element = card.querySelector(selector);
    if (element && element.textContent.trim()) {
      return element.textContent.trim();
    }
  }
  
  // If still no name, try to find any text that might be a product name
  const possibleNameElements = card.querySelectorAll('p, h1, h2, h3, h4, .text-title, [class*="title"], [class*="name"], strong, b');
  for (const element of possibleNameElements) {
    const text = element.textContent.trim();
    if (text && text.length > 3 && text.length < 100) {
      return text;
    }
  }
  
  // Last resort: use any prominent text in the card as a potential name
  const allTextElements = card.querySelectorAll('*');
  for (const element of allTextElements) {
    if (element.children.length === 0 && element.textContent) {
      const text = element.textContent.trim();
      if (text && text.length > 3 && text.length < 100) {
        return text;
      }
    }
  }
  
  return null;
}

/**
 * Extracts product description from a card element
 */
export function extractProductDescription(card: Element, productName: string | null): string | null {
  const descSelectors = [
    'p.offer-card__text', '.offer-card-v3__description', '.product-card__product-subtitle',
    '.promotion-item__description', '.details', '.description', '[class*="description"]', 
    '[class*="subtitle"]', '[class*="text"]', '.offer-card__preamble',
    '.product__description', '.item__description', '.product-details', '.product-info'
  ];
  
  // Try each selector
  for (const selector of descSelectors) {
    const element = card.querySelector(selector);
    if (element && element.textContent.trim()) {
      return element.textContent.trim();
    }
  }
  
  // If no description found yet, look for secondary text elements
  if (productName) {
    const allParagraphs = card.querySelectorAll('p, div.text, span.text');
    for (const para of allParagraphs) {
      const text = para.textContent.trim();
      if (text && text !== productName && text.length > 5) {
        return text;
      }
    }
  }
  
  return null;
}

/**
 * Extracts product price from a card element
 */
export function extractProductPrice(card: Element): { price: number | null; priceStr: string | null } {
  // Try multiple price element selectors
  const priceSelectors = [
    'div.price-splash__text', '.product-price', '.offer-card-v3__price-value',
    '.price-standard__value', '.price', '[class*="price"]', '.promotion-item__price',
    '.offer-card__price', '.product__price', '.item__price', 
    'span[class*="price"]', 'div[class*="price"]', 'p[class*="price"]'
  ];
  
  for (const selector of priceSelectors) {
    const element = card.querySelector(selector);
    if (element) {
      // Look for specific price value within the price element
      const valueElement = element.querySelector('span.price-splash__text__firstValue') || 
                          element.querySelector('.price-standard__value') ||
                          element;
                          
      if (valueElement) {
        const priceStr = valueElement.textContent.trim();
        // Extract numeric part of the price, removing non-numeric characters except decimal point
        const numericPrice = priceStr.replace(/[^\d,.]/g, '').replace(',', '.');
        const price = numericPrice ? parseFloat(numericPrice) : null;
        return { price, priceStr };
      }
    }
  }
  
  // If still no price found, try to find any text that looks like a price
  const allTextNodes: string[] = [];
  const textNodes = card.querySelectorAll('*');
  textNodes.forEach(node => {
    if (node.textContent) {
      allTextNodes.push(node.textContent.trim());
    }
  });
  
  for (const text of allTextNodes) {
    // Look for patterns like "25:-", "25.90:-", "25,90 kr", etc.
    const priceMatches = text.match(/(\d+[.,]?\d*)(?:\s*(?::-|kr|SEK|:-\s*kr))/i);
    if (priceMatches && priceMatches[1]) {
      const price = parseFloat(priceMatches[1].replace(',', '.'));
      return { price, priceStr: text };
    }
  }
  
  return { price: null, priceStr: null };
}

/**
 * Extracts product image URL from a card element
 */
export function extractProductImageUrl(card: Element, baseUrl: string): string | null {
  const imageSelectors = [
    'img.offer-card__image-inner', '.product-image img', '.product-card__product-image img',
    '.offer-card-v3__image', 'img', '[class*="image"] img', '.promotion-item__image img',
    '.product__image img', '.item__image img', 'picture img', 'figure img'
  ];
  
  for (const selector of imageSelectors) {
    const element = card.querySelector(selector);
    if (element) {
      const imageUrl = element.getAttribute('src') || element.getAttribute('data-src');
      
      // Make sure the URL is absolute
      if (imageUrl) {
        return imageUrl.startsWith('http') ? imageUrl : new URL(imageUrl, baseUrl).href;
      }
    }
  }
  
  // Check for <picture> element with srcset if no direct image found
  const picture = card.querySelector('picture');
  if (picture) {
    const source = picture.querySelector('source');
    if (source) {
      const srcset = source.getAttribute('srcset');
      if (srcset) {
        const firstSrc = srcset.split(',')[0].trim().split(' ')[0];
        if (firstSrc) {
          return firstSrc.startsWith('http') ? firstSrc : new URL(firstSrc, baseUrl).href;
        }
      }
    }
  }
  
  return null;
}

/**
 * Processes a single product card and extracts product information
 */
export function processProductCard(
  card: Element, 
  baseUrl: string, 
  processedProductNames: Set<string>
): Product | null {
  try {
    // Extract product name
    const name = extractProductName(card);
    
    // Skip if no name or already processed
    if (!name || processedProductNames.has(name)) {
      return null;
    }
    
    // Extract other product details
    const description = extractProductDescription(card, name);
    const { price, priceStr } = extractProductPrice(card);
    const imageUrl = extractProductImageUrl(card, baseUrl);
    
    // Add to processed names to prevent duplicates
    processedProductNames.add(name);
    
    console.log(`Processed product: ${name} with price: ${price || 'unknown'} (${priceStr || 'no price found'})`);
    
    return {
      name,
      description,
      price,
      image_url: imageUrl
    };
  } catch (cardError) {
    console.error("Error processing a card:", cardError);
    return null;
  }
}

/**
 * Extracts all products from the provided offer cards
 */
export function extractProducts(offerCards: Element[], baseUrl: string): Product[] {
  const products: Product[] = [];
  const processedProductNames = new Set<string>();
  
  for (const card of offerCards) {
    const product = processProductCard(card, baseUrl, processedProductNames);
    if (product) {
      products.push(product);
    }
  }
  
  console.log(`Successfully processed ${products.length} products out of ${offerCards.length} elements`);
  
  if (products.length === 0) {
    console.error("No products were found. HTML structure might have changed.");
    throw new Error("No products found on the page. The website structure may have changed.");
  }
  
  return products;
}
