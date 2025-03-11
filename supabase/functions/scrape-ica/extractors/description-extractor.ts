
/**
 * Extracts product description from a card element
 */
export function extractProductDescription(card: Element, productName: string | null): { 
  description: string | null;
  quantityInfo: string | null;
} {
  const descSelectors = [
    'p.offer-card__text', '.offer-card-v3__description', '.product-card__product-subtitle',
    '.promotion-item__description', '.details', '.description', '[class*="description"]', 
    '[class*="subtitle"]', '[class*="text"]', '.offer-card__preamble',
    '.product__description', '.item__description', '.product-details', '.product-info'
  ];
  
  let description: string | null = null;
  let quantityInfo: string | null = null;
  
  // Try each selector for main description
  for (const selector of descSelectors) {
    const element = card.querySelector(selector);
    if (element && element.textContent.trim()) {
      description = element.textContent.trim();
      break;
    }
  }
  
  // If no description found yet, look for secondary text elements
  if (!description && productName) {
    const allParagraphs = card.querySelectorAll('p, div.text, span.text');
    for (const para of allParagraphs) {
      const text = para.textContent.trim();
      if (text && text !== productName && text.length > 5) {
        description = text;
        break;
      }
    }
  }
  
  // Look for quantity information (like weight, volume, etc.)
  const quantitySelectors = [
    '.weight', '.volume', '.quantity', '.size', '.product-size', '.pack-size',
    '[class*="weight"]', '[class*="volume"]', '[class*="quantity"]', '[class*="size"]'
  ];
  
  for (const selector of quantitySelectors) {
    const element = card.querySelector(selector);
    if (element && element.textContent.trim()) {
      quantityInfo = element.textContent.trim();
      break;
    }
  }
  
  // If no quantity info found yet, look for patterns in descriptions or other text elements
  if (!quantityInfo) {
    const allElements = card.querySelectorAll('*');
    for (const element of allElements) {
      const text = element.textContent?.trim();
      if (text) {
        // Look for patterns like "500 g", "1 kg", "750 ml", etc.
        const quantityMatch = text.match(/(\d+(?:[,.]\d+)?\s*(?:g|kg|ml|l|st|pack|förp))\b/i);
        if (quantityMatch) {
          quantityInfo = quantityMatch[0];
          break;
        }
      }
    }
  }
  
  // Extract brand and weight from description if available
  if (description && !quantityInfo) {
    const match = description.match(/([^,]+),\s*([^,]+)/);
    if (match) {
      // Description might be in format "Brand, Weight" like "Felix, 560 g"
      description = match[1].trim();
      quantityInfo = match[2].trim();
    }
  }
  
  return { description, quantityInfo };
}
