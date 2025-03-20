
// Main product extractor that orchestrates the extraction process
import { extractFallbackProducts, createSampleProducts } from "./extractors/fallback-extractor.ts";
import { ExtractorResult } from "./extractors/base-extractor.ts";

// Function to extract products from the Hemköp webpage
export function extractProducts(document: Document, baseUrl: string): ExtractorResult[] {
  console.log("Starting product extraction from Hemköp webpage");
  
  try {
    // Try to find product elements in the HTML document
    const productContainers = document.querySelectorAll('.product-card, .offer-card, .product-item, [class*="product"], [class*="offer"]');
    console.log(`Found ${productContainers.length} potential product containers`);
    
    if (productContainers.length === 0) {
      console.log("No product containers found, attempting fallback extraction");
      return extractFallbackProducts(document);
    }
    
    const products: ExtractorResult[] = [];
    const processedNames = new Set<string>();
    
    for (const container of productContainers) {
      try {
        // Extract name
        const nameElement = container.querySelector('h2, h3, h4, .title, [class*="title"], [class*="name"], .product-title, .offer-title');
        if (!nameElement || !nameElement.textContent) continue;
        
        const name = nameElement.textContent.trim();
        
        // Skip items with no name or duplicates
        if (!name || name.length < 3 || processedNames.has(name.toLowerCase())) continue;
        
        // Extract price
        const priceElement = container.querySelector('.price, [class*="price"], .product-price, .offer-price');
        let price: number | null = null;
        
        if (priceElement) {
          const priceText = priceElement.textContent?.trim() || '';
          // Find digits with optional decimal separator
          const priceMatch = priceText.match(/(\d+)[,.:]?(\d*)/);
          
          if (priceMatch) {
            const wholePart = parseInt(priceMatch[1]);
            
            // If we have decimal part
            if (priceMatch[2] && priceMatch[2].length > 0) {
              const decimalPart = parseInt(priceMatch[2]);
              price = decimalPart > 0 ? parseFloat(`${wholePart}.${decimalPart}`) : wholePart;
            } else {
              price = wholePart;
            }
          }
        }
        
        // Extract image
        const imgElement = container.querySelector('img');
        let imageUrl = 'https://assets.icanet.se/t_product_large_v1,f_auto/7300156501245.jpg'; // default
        
        if (imgElement) {
          const src = imgElement.getAttribute('src') || imgElement.getAttribute('data-src');
          
          if (src) {
            imageUrl = src.startsWith('http') ? 
              src : 
              src.startsWith('//') ? 
                `https:${src}` : 
                `${baseUrl}${src.startsWith('/') ? '' : '/'}${src}`;
          }
        }
        
        // Extract description
        const descElement = container.querySelector('.description, [class*="desc"], .product-description, .subtitle, .info');
        const description = descElement ? descElement.textContent?.trim() || null : null;
        
        // Extract offer details
        const offerElement = container.querySelector('.offer-badge, .discount, .promo, [class*="badge"]');
        const offerDetails = offerElement ? 
          offerElement.textContent?.trim() || 'Erbjudande' : 
          'Erbjudande'; // Default text
        
        // Add to processed names to avoid duplicates
        processedNames.add(name.toLowerCase());
        
        // Add product to list
        products.push({
          name,
          price,
          description,
          image_url: imageUrl,
          offer_details: offerDetails
        });
        
      } catch (itemError) {
        console.error("Error extracting product data:", itemError);
      }
    }
    
    console.log(`Successfully extracted ${products.length} products`);
    
    if (products.length === 0) {
      console.log("No products successfully extracted, using fallback method");
      return extractFallbackProducts(document);
    }
    
    return products;
    
  } catch (error) {
    console.error("Error during product extraction:", error);
    
    // Return fallback products
    const fallbackProducts = createSampleProducts();
    console.log("Using fallback products due to extraction error");
    return fallbackProducts;
  }
}
