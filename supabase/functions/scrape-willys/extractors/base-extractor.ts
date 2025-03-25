
// Base types and utilities for extractors

export interface ExtractorResult {
  name: string;
  price: number | null;
  description: string | null;
  image_url: string;
  offer_details: string;
  original_price?: number | null;
  store_name?: string;
}

/**
 * Normalizes an image URL by handling relative paths
 */
export function normalizeImageUrl(url: string, baseUrl: string): string {
  if (!url) {
    return 'https://assets.icanet.se/t_product_large_v1,f_auto/7300156501245.jpg';
  }
  
  if (url.startsWith('http')) {
    return url;
  } else {
    return `${baseUrl}${url.startsWith('/') ? '' : '/'}${url}`;
  }
}

/**
 * Extracts a price from a string
 */
export function extractPrice(priceText: string): number | null {
  if (!priceText) {
    return null;
  }
  
  // Handle different price formats (29:90 kr, 29,90 kr, 29.90 kr, 29:-)
  const priceMatch = priceText.match(/(\d+)[,\.:]*(\d*)/);
  
  if (priceMatch) {
    const whole = parseInt(priceMatch[1]);
    const decimal = priceMatch[2] ? parseInt(priceMatch[2]) : 0;
    
    if (decimal > 0) {
      return parseFloat(`${whole}.${decimal}`);
    } else {
      return whole;
    }
  }
  
  return null;
}
