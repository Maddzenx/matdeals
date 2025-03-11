
/**
 * Extracts product price from a card element
 */
export function extractProductPrice(card: Element): { 
  price: number | null; 
  priceStr: string | null;
  originalPrice: string | null;
  comparisonPrice: string | null;
  offerDetails: string | null;
} {
  // Try multiple price element selectors
  const priceSelectors = [
    'div.price-splash__text', '.product-price', '.offer-card-v3__price-value',
    '.price-standard__value', '.price', '[class*="price"]', '.promotion-item__price',
    '.offer-card__price', '.product__price', '.item__price', 
    'span[class*="price"]', 'div[class*="price"]', 'p[class*="price"]'
  ];
  
  let price: number | null = null;
  let priceStr: string | null = null;
  let originalPrice: string | null = null;
  let comparisonPrice: string | null = null;
  let offerDetails: string | null = null;
  
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
  
  // Look for original price
  const originalPriceSelectors = [
    '.original-price', '.regular-price', '.was-price', '[class*="original"]', 
    '[class*="regular"]', '.price-was', '.old-price', '.strikethrough-price',
    '.price-regular', '.price__original', '[data-price-original]'
  ];
  
  for (const selector of originalPriceSelectors) {
    const element = card.querySelector(selector);
    if (element && element.textContent) {
      originalPrice = element.textContent.trim();
      break;
    }
  }
  
  // If not found yet, look for text with "Ord.pris"
  if (!originalPrice) {
    const allText = Array.from(card.querySelectorAll('*'))
      .map(el => el.textContent?.trim())
      .filter(text => text && text.includes('Ord.pris'));
      
    if (allText.length > 0) {
      originalPrice = allText[0];
    }
  }
  
  // Look for comparison price (jmfpris)
  const comparisonPriceSelectors = [
    '.comparison-price', '.unit-price', '.price-per-unit', '[class*="comparison"]',
    '[class*="jmfpris"]', '.price-comparison', '.per-unit-price'
  ];
  
  for (const selector of comparisonPriceSelectors) {
    const element = card.querySelector(selector);
    if (element && element.textContent) {
      comparisonPrice = element.textContent.trim();
      break;
    }
  }
  
  // If not found yet, look for text with "Jmfpris"
  if (!comparisonPrice) {
    const allText = Array.from(card.querySelectorAll('*'))
      .map(el => el.textContent?.trim())
      .filter(text => text && text.includes('Jmfpris'));
      
    if (allText.length > 0) {
      comparisonPrice = allText[0];
    }
  }
  
  // Look for offer details (like "2 för 69 kr")
  const offerDetailsSelectors = [
    '.offer-details', '.promotion-details', '.deal-text', '[class*="offer"]',
    '[class*="promotion"]', '.price-deal', '.special-offer'
  ];
  
  for (const selector of offerDetailsSelectors) {
    const element = card.querySelector(selector);
    if (element && element.textContent) {
      offerDetails = element.textContent.trim();
      break;
    }
  }
  
  // If not found yet, look for text with "för" or "max" in price elements
  if (!offerDetails) {
    const allText = Array.from(card.querySelectorAll('[class*="price"], [class*="offer"], p, span'))
      .map(el => el.textContent?.trim())
      .filter(text => text && (text.includes('för') || text.includes('Max') || text.includes('per')));
      
    if (allText.length > 0) {
      offerDetails = allText[0];
    }
  }
  
  // If still no price found, try to find any text that looks like a price
  if (price === null) {
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
  }
  
  return { price, priceStr, originalPrice, comparisonPrice, offerDetails };
}
