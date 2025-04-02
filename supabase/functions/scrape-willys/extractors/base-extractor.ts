// Base extractor with common utilities and shared functionality
export interface ExtractorResult {
  name: string;
  description: string | null;
  price: number | null;
  original_price: number | null;
  comparison_price: string | null;
  image_url: string | null;
  offer_details: string | null;
  quantity_info: string | null;
  is_member_price: boolean;
  store: string;
  store_location: string | null;
}

export const DEFAULT_IMAGE_URL = 'https://assets.icanet.se/t_product_large_v1,f_auto/7300156501245.jpg';

/**
 * Normalizes an image URL by handling relative paths
 */
export function normalizeImageUrl(imageUrl: string | null, baseUrl: string): string {
  if (!imageUrl) {
    return DEFAULT_IMAGE_URL;
  }
  
  if (imageUrl.startsWith('http')) {
    return imageUrl;
  } else if (imageUrl.startsWith('//')) {
    return 'https:' + imageUrl;
  } else {
    return `${baseUrl}${imageUrl.startsWith('/') ? '' : '/'}${imageUrl}`;
  }
}

/**
 * Extracts a price from a string and returns it as a number
 * The returned value MUST be an integer for PostgreSQL compatibility
 */
export function extractPrice(priceText: string | null): number | null {
  if (!priceText) return null;
  
  // Remove any non-price characters, keeping only numbers, decimals, and decimal separators
  const cleanedText = priceText.replace(/[^\d.,]/g, '');
  
  // Handle various price formats
  const priceMatch = cleanedText.match(/(\d+)[,.:]?(\d*)/);
  if (!priceMatch) return null;
  
  let price = parseInt(priceMatch[1]);
  
  // Handle decimal parts if present
  if (priceMatch[2] && priceMatch[2].length > 0) {
    const decimal = parseInt(priceMatch[2]);
    if (decimal > 0) {
      // Convert to decimal value (e.g. 19,90 => 19.9)
      const combinedPrice = parseFloat(`${price}.${decimal}`);
      // Round to integer for database compatibility
      return Math.round(combinedPrice);
    }
  }
  
  return price;
}
