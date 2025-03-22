
/**
 * Extracts product price from a card element
 */
export function extractProductPrice(card: Element): { 
  price: number | null; 
  priceStr: string | null;
  originalPrice: string | null;
  comparisonPrice: string | null;
  offerDetails: string | null;
  isMemberPrice: boolean;
} {
  const price = findMainPrice(card);
  const originalPrice = findOriginalPrice(card);
  const comparisonPrice = findComparisonPrice(card);
  const offerDetails = findOfferDetails(card);
  const isMemberPrice = checkForMemberPrice(card);
  
  return { 
    ...price,
    originalPrice, 
    comparisonPrice, 
    offerDetails, 
    isMemberPrice 
  };
}

/**
 * Finds the main current price of a product
 */
function findMainPrice(card: Element): { price: number | null; priceStr: string | null } {
  // Try multiple price element selectors
  const priceSelectors = [
    'div.price-splash__text', '.product-price', '.offer-card-v3__price-value',
    '.price-standard__value', '.price', '[class*="price"]', '.promotion-item__price',
    '.offer-card__price', '.product__price', '.item__price', 
    'span[class*="price"]', 'div[class*="price"]', 'p[class*="price"]',
    '.pricebox', '.price-amount', '.offer-price'
  ];
  
  let price: number | null = null;
  let priceStr: string | null = null;
  
  // Find main price
  for (const selector of priceSelectors) {
    const element = card.querySelector(selector);
    if (element) {
      // Look for specific price value within the price element
      const valueElement = element.querySelector('span.price-splash__text__firstValue') || 
                          element.querySelector('.price-standard__value') ||
                          element;
                          
      if (valueElement) {
        priceStr = valueElement.textContent.trim();
        // Extract numeric part of the price, removing non-numeric characters except decimal point
        const numericPrice = priceStr.replace(/[^\d,.]/g, '').replace(',', '.');
        price = numericPrice ? parseFloat(numericPrice) : null;
        break;
      }
    }
  }
  
  // If still no price found, try to find any text that looks like a price
  if (price === null) {
    const result = findPriceFromAllText(card);
    price = result.price;
    priceStr = result.priceStr;
  }
  
  return { price, priceStr };
}

/**
 * Finds price by scanning all text nodes for price patterns
 */
function findPriceFromAllText(card: Element): { price: number | null; priceStr: string | null } {
  let price: number | null = null;
  let priceStr: string | null = null;
  
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
      price = parseFloat(priceMatches[1].replace(',', '.'));
      priceStr = text;
      break;
    }
  }
  
  return { price, priceStr };
}

/**
 * Finds the original price (before discount) of a product
 */
function findOriginalPrice(card: Element): string | null {
  // Look for original price
  const originalPriceSelectors = [
    '.original-price', '.regular-price', '.was-price', '[class*="original"]', 
    '[class*="regular"]', '.price-was', '.old-price', '.strikethrough-price',
    '.price-regular', '.price__original', '[data-price-original]', '.pre-price',
    'del', '.price-before', '.full-price'
  ];
  
  for (const selector of originalPriceSelectors) {
    const element = card.querySelector(selector);
    if (element && element.textContent) {
      return element.textContent.trim();
    }
  }
  
  // If not found yet, look for text with "Ord.pris" or similar
  const allText = Array.from(card.querySelectorAll('*'))
    .map(el => el.textContent?.trim())
    .filter(Boolean)
    .filter(text => 
      text.includes('Ord.pris') || 
      text.includes('Ordinarie') || 
      text.includes('Tidigare') ||
      text.match(/\d+[.,]\d+\s*kr\s*\/\s*\d+[.,]\d+\s*kr/)
    );
    
  if (allText.length > 0) {
    return allText[0];
  }
  
  return null;
}

/**
 * Finds the comparison price (jmfpris) of a product
 */
function findComparisonPrice(card: Element): string | null {
  // Look for comparison price (jmfpris)
  const comparisonPriceSelectors = [
    '.comparison-price', '.unit-price', '.price-per-unit', '[class*="comparison"]',
    '[class*="jmfpris"]', '.price-comparison', '.per-unit-price', '.price-per',
    '.price-per-kg', '.price-per-unit'
  ];
  
  for (const selector of comparisonPriceSelectors) {
    const element = card.querySelector(selector);
    if (element && element.textContent) {
      return element.textContent.trim();
    }
  }
  
  // If not found yet, look for text with "Jmfpris" or similar patterns
  const allText = Array.from(card.querySelectorAll('*'))
    .map(el => el.textContent?.trim())
    .filter(Boolean)
    .filter(text => 
      text.includes('Jmfpris') || 
      text.match(/\d+[.,]\d+\s*kr\s*\/\s*kg/) ||
      text.match(/\d+[.,]\d+\s*kr\s*\/\s*liter/) ||
      text.match(/\d+[.,]\d+\s*\/\s*\w+/)
    );
    
  if (allText.length > 0) {
    return allText[0];
  }
  
  return null;
}

/**
 * Finds offer details like "2 för 69 kr" or "Max 1 köp/hushåll"
 */
function findOfferDetails(card: Element): string | null {
  // Look for offer details
  const offerDetailsSelectors = [
    '.offer-details', '.promotion-details', '.deal-text', '[class*="offer"]',
    '[class*="promotion"]', '.price-deal', '.special-offer', '.offer-terms',
    '.limitation', '.campaign-text', '.banner-text'
  ];
  
  // First look for dedicated offer details elements
  for (const selector of offerDetailsSelectors) {
    const element = card.querySelector(selector);
    if (element && element.textContent) {
      const text = element.textContent.trim();
      if (text.length > 3 && text.length < 50) { // Reasonable length for offer details
        return text;
      }
    }
  }
  
  // If not found yet, look for specific patterns in the text
  return findOfferDetailsFromText(card);
}

/**
 * Finds offer details by scanning text content for common patterns
 */
function findOfferDetailsFromText(card: Element): string | null {
  const offerPatterns = [
    /(\d+)\s*för\s*(\d+[.,]?\d*)/i,  // "3 för 70"
    /Max\s*(\d+)\s*köp/i,            // "Max 1 köp"
    /(\d+[.,]?\d*)\s*kr\s*\/\s*st/i, // "25 kr/st"
    /köp\s*(\d+)\s*betala\s*för\s*(\d+)/i // "Köp 3 betala för 2"
  ];
  
  const allText = Array.from(card.querySelectorAll('*'))
    .map(el => el.textContent?.trim())
    .filter(Boolean);
  
  for (const text of allText) {
    for (const pattern of offerPatterns) {
      if (pattern.test(text) && text.length < 50) {
        return text;
      }
    }
    
    // Also look for text with specific keywords in price elements
    if ((text.includes('för') || text.includes('Max') || text.includes('per') || 
         text.includes('köp') || text.includes('st')) && text.length < 50) {
      return text;
    }
  }
  
  return null;
}

/**
 * Checks if the price is a member-only price
 */
function checkForMemberPrice(card: Element): boolean {
  // Check for "Stämmispris" or member-only indicators
  const memberPriceIndicators = [
    '.member-price', '.stammis-price', '.loyalty-price', '[class*="member"]', 
    '[class*="stammis"]', '[class*="loyalty"]', '.member-offer', '.stammis-offer'
  ];
  
  for (const selector of memberPriceIndicators) {
    if (card.querySelector(selector)) {
      return true;
    }
  }
  
  // If not found by selector, check any text mentioning "Stammis" or members
  const allText = Array.from(card.querySelectorAll('*'))
    .map(el => el.textContent?.trim())
    .filter(Boolean);
  
  for (const text of allText) {
    if (text.toLowerCase().includes('stammis') || 
        text.toLowerCase().includes('medlems') ||
        text.toLowerCase().includes('för medlemmar') ||
        text.toLowerCase().includes('för dig som är medlem')) {
      return true;
    }
  }
  
  return false;
}
