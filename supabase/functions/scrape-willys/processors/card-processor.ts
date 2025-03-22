
type Product = {
  name: string;
  description: string;
  price: number | null;
  image_url: string;
  original_price?: number | null;
  comparison_price?: string;
  offer_details?: string;
  quantity_info?: string;
};

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
    
    if (!name) {
      return null;
    }
    
    // Normalize name for deduplication
    const normalizedName = name.toLowerCase().trim();
    
    if (!normalizedName || processedProductNames.has(normalizedName)) {
      return null;
    }
    
    // Extract other product details
    const description = extractProductDescription(card);
    const { price, originalPrice } = extractProductPrice(card);
    const imageUrl = extractProductImageUrl(card, baseUrl);
    
    // Add to processed names
    processedProductNames.add(normalizedName);
    
    return {
      name,
      description,
      price,
      image_url: imageUrl,
      original_price: originalPrice,
      offer_details: extractOfferDetails(card)
    };
  } catch (cardError) {
    console.error("Error processing a card:", cardError);
    return null;
  }
}

// Helper functions to extract various product details

function extractProductName(card: Element): string | null {
  // Try various selectors for product name
  const nameSelectors = [
    '.product-name', 
    '.product-title',
    '.title',
    '[class*="product-name"]',
    '[class*="product-title"]',
    'h2', 
    'h3',
    '[data-test="product-name"]'
  ];
  
  for (const selector of nameSelectors) {
    const nameElement = card.querySelector(selector);
    if (nameElement && nameElement.textContent) {
      return nameElement.textContent.trim();
    }
  }
  
  // Fallback to any heading
  const heading = card.querySelector('h1, h2, h3, h4, h5');
  if (heading && heading.textContent) {
    return heading.textContent.trim();
  }
  
  return null;
}

function extractProductDescription(card: Element): string {
  // Try various selectors for product description
  const descSelectors = [
    '.product-description',
    '.description',
    '[class*="description"]',
    '[class*="product-desc"]',
    '[data-test="product-description"]',
    '.subtitle'
  ];
  
  for (const selector of descSelectors) {
    const descElement = card.querySelector(selector);
    if (descElement && descElement.textContent) {
      return descElement.textContent.trim();
    }
  }
  
  return "Ingen beskrivning tillgänglig";
}

function extractProductPrice(card: Element): { price: number | null; originalPrice: number | null } {
  // Try various selectors for prices
  const priceSelectors = [
    '.price', 
    '.current-price',
    '[class*="price"]',
    '[data-test="price"]',
    '.offer-price'
  ];
  
  let priceText = null;
  
  for (const selector of priceSelectors) {
    const priceElement = card.querySelector(selector);
    if (priceElement && priceElement.textContent) {
      priceText = priceElement.textContent.trim();
      break;
    }
  }
  
  let price = null;
  if (priceText) {
    // Extract numeric price from text (e.g., "29:90 kr" -> 29.90)
    const priceMatch = priceText.match(/(\d+)[,\.:]*(\d*)/);
    if (priceMatch) {
      const whole = parseInt(priceMatch[1]);
      const decimal = priceMatch[2] ? parseInt(priceMatch[2]) : 0;
      price = whole + (decimal / 100);
    }
  }
  
  // Look for original price
  const originalPriceSelectors = [
    '.original-price',
    '.old-price',
    '[class*="original-price"]',
    '[class*="old-price"]',
    '[data-test="original-price"]'
  ];
  
  let originalPriceText = null;
  
  for (const selector of originalPriceSelectors) {
    const element = card.querySelector(selector);
    if (element && element.textContent) {
      originalPriceText = element.textContent.trim();
      break;
    }
  }
  
  let originalPrice = null;
  if (originalPriceText) {
    const priceMatch = originalPriceText.match(/(\d+)[,\.:]*(\d*)/);
    if (priceMatch) {
      const whole = parseInt(priceMatch[1]);
      const decimal = priceMatch[2] ? parseInt(priceMatch[2]) : 0;
      originalPrice = whole + (decimal / 100);
    }
  }
  
  return { price, originalPrice };
}

function extractProductImageUrl(card: Element, baseUrl: string): string {
  // Try various selectors for product image with Willys-specific selectors
  const imgSelectors = [
    'img.product-image', 
    '.product-image img', 
    '.product-card__image img',
    '.productCard__image img',
    '.product-list-item__image img',
    'img.lazy-image',
    '.image-container img',
    '[data-testid="product-image"] img',
    '[class*="productImage"] img',
    'img[src*="willys"]',
    'img',
    '[class*="image"] img',
    '[data-test="product-image"]'
  ];
  
  for (const selector of imgSelectors) {
    const imgElement = card.querySelector(selector);
    if (imgElement) {
      // Try different image attributes (Willys may use data-src for lazy loading)
      const src = imgElement.getAttribute('src') || 
                  imgElement.getAttribute('data-src') || 
                  imgElement.getAttribute('data-lazy-src');
      
      if (src) {
        // Handle relative URLs
        if (src.startsWith('http')) {
          // Skip ICA domain images
          if (src.includes('icanet.se') || src.includes('assets.icanet')) {
            continue;
          }
          return src;
        } else {
          return `${baseUrl}${src.startsWith('/') ? '' : '/'}${src}`;
        }
      }
    }
  }
  
  // Search for background image in style attribute
  const elementWithBgImage = card.querySelector('[style*="background-image"]');
  if (elementWithBgImage) {
    const style = elementWithBgImage.getAttribute('style');
    if (style) {
      const match = style.match(/url\(['"]?(.*?)['"]?\)/);
      if (match && match[1]) {
        const bgImageUrl = match[1];
        if (!bgImageUrl.includes('icanet.se')) {
          return bgImageUrl.startsWith('http') ? bgImageUrl : `${baseUrl}${bgImageUrl.startsWith('/') ? '' : '/'}${bgImageUrl}`;
        }
      }
    }
  }
  
  // Default image if none found (Willys default placeholder)
  return 'https://www.willys.se/content/dam/placeholder-200x200.png';
}

function extractOfferDetails(card: Element): string {
  // Try various selectors for offer details
  const offerSelectors = [
    '.offer-badge',
    '.discount',
    '.promo',
    '[class*="offer"]',
    '[class*="discount"]',
    '[class*="promo"]',
    '[data-test="offer-badge"]'
  ];
  
  for (const selector of offerSelectors) {
    const element = card.querySelector(selector);
    if (element && element.textContent) {
      return element.textContent.trim();
    }
  }
  
  return "Erbjudande";
}
