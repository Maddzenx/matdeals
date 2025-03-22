
// Base extractor with common utilities and shared functionality
export interface ExtractorResult {
  name: string;
  price: number | null;
  description: string | null;
  image_url: string;
  offer_details: string;
}

// Updated to use Willys domain for default image
export const DEFAULT_IMAGE_URL = 'https://www.willys.se/content/dam/placeholder-200x200.png';

export function normalizeImageUrl(imageUrl: string | null, baseUrl: string): string {
  if (!imageUrl) {
    return DEFAULT_IMAGE_URL;
  }
  
  if (imageUrl.startsWith('http')) {
    // If it's already a full URL but contains ICA domain, replace with default Willys image
    if (imageUrl.includes('icanet.se') || imageUrl.includes('assets.icanet')) {
      return DEFAULT_IMAGE_URL;
    }
    return imageUrl;
  } else if (imageUrl.startsWith('//')) {
    return 'https:' + imageUrl;
  } else {
    return `${baseUrl}${imageUrl.startsWith('/') ? '' : '/'}${imageUrl}`;
  }
}

export function extractPrice(priceText: string | null): number | null {
  if (!priceText) return null;
  
  const priceMatch = priceText.match(/(\d+)[,.:]?(\d*)/);
  if (!priceMatch) return null;
  
  let price = parseInt(priceMatch[1]);
  
  // Handle decimal parts if present and convert to öre
  if (priceMatch[2] && priceMatch[2].length > 0) {
    const decimal = parseInt(priceMatch[2]);
    if (decimal > 0) {
      price = price * 100 + decimal;
      price = price / 100;
    }
  }
  
  return price;
}
