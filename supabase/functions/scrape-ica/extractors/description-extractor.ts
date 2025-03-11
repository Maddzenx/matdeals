
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
    '.product__description', '.item__description', '.product-details', '.product-info',
    '.product-data', '.product-meta', '.brand-info'
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
    const allParagraphs = card.querySelectorAll('p, div.text, span.text, .subtitle, .description');
    for (const para of allParagraphs) {
      const text = para.textContent.trim();
      if (text && text !== productName && text.length > 3) {
        description = text;
        break;
      }
    }
  }
  
  // Look for quantity information (like weight, volume, etc.)
  const quantitySelectors = [
    '.weight', '.volume', '.quantity', '.size', '.product-size', '.pack-size',
    '[class*="weight"]', '[class*="volume"]', '[class*="quantity"]', '[class*="size"]',
    '.measure', '.amount', '.product-amount', '.product-measure'
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
        const quantityMatch = text.match(/(\d+(?:[,.]\d+)?\s*(?:g|kg|ml|l|cl|st|pack|förp))\b/i);
        if (quantityMatch) {
          quantityInfo = quantityMatch[0];
          break;
        }
      }
    }
  }
  
  // Try to extract brand and product information from the description
  if (description) {
    // Extract brand and weight from description if available
    // Patterns like "Brand, Weight" (e.g., "Felix, 560 g")
    const brandWeightMatch = description.match(/([^,]+),\s*([^,]+)/);
    
    if (brandWeightMatch) {
      const possibleBrand = brandWeightMatch[1].trim();
      const possibleQuantity = brandWeightMatch[2].trim();
      
      // Check if second part looks like quantity info (contains numbers and units)
      const isQuantityInfo = /\d+\s*(?:g|kg|ml|l|cl|st|pack|förp)/i.test(possibleQuantity);
      
      if (isQuantityInfo) {
        if (!quantityInfo) {
          quantityInfo = possibleQuantity;
        }
        
        // Only use the brand as description if we don't have a better description
        if (possibleBrand.length > 1 && possibleBrand !== productName) {
          description = possibleBrand;
        }
      }
    }
  }
  
  // If we still don't have a good description, look for brand names
  if (!description || description.length < 3) {
    const brandSelectors = ['.brand', '.manufacturer', '.producer', '.vendor'];
    
    for (const selector of brandSelectors) {
      const element = card.querySelector(selector);
      if (element && element.textContent.trim()) {
        description = element.textContent.trim();
        break;
      }
    }
  }
  
  // Try to extract description from any text containing common Swedish brands
  if (!description || description.length < 3) {
    const commonBrands = ['Arla', 'Felix', 'Scan', 'ICA', 'Findus', 'Coop', 'Valio', 'Fazer', 'Abba', 'Pågen'];
    
    const allElements = card.querySelectorAll('*');
    for (const element of allElements) {
      const text = element.textContent?.trim();
      if (text && text !== productName) {
        for (const brand of commonBrands) {
          if (text.includes(brand) && text.length < 50) {
            description = text;
            break;
          }
        }
        if (description) break;
      }
    }
  }
  
  return { description, quantityInfo };
}
