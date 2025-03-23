// Generic extractor for when specific extractors fail
import { ExtractorResult, normalizeImageUrl, extractPrice } from "./base-extractor.ts";

export function extractGenericProducts(document: Document, baseUrl: string, storeName?: string): ExtractorResult[] {
  console.log("Using generic product extractor since specific extractors failed");
  
  const products: ExtractorResult[] = [];
  const storeNameFormatted = storeName?.toLowerCase() || 'willys';
  
  try {
    // Look for any elements that might contain product information
    const potentialProductContainers = Array.from(document.querySelectorAll('div, article, section, li'))
      .filter(el => {
        // Element should have some content
        if (!el.textContent || el.textContent.trim().length < 10) {
          return false;
        }
        
        // Element should have an image
        const hasImage = el.querySelector('img') !== null;
        
        // Element should have price-like text
        const hasPriceText = el.textContent.match(/\d+[\s:,.]?\d*\s*(kr|:-)/i) !== null;
        
        // Element should not be too big (to avoid selecting whole page sections)
        const notTooBig = el.querySelectorAll('*').length < 50;
        
        return hasImage && hasPriceText && notTooBig;
      });
    
    console.log(`Found ${potentialProductContainers.length} potential product containers`);
    
    // Process each potential product container
    for (const container of potentialProductContainers) {
      try {
        // Extract product details
        
        // 1. Name - look for most prominent text
        let name = '';
        const allText = container.textContent || '';
        const lines = allText.split(/[\r\n]+/).map(line => line.trim()).filter(line => line.length > 0);
        
        // First, try to find a line that doesn't look like a price and is reasonably long
        for (const line of lines) {
          if (line.length > 3 && line.length < 60 && !line.match(/^\d+[\s:,.]?\d*\s*(kr|:-)/i) && !line.match(/jämförpris/i)) {
            name = line;
            break;
          }
        }
        
        // If no suitable line found, try to use text from semantic elements
        if (!name) {
          const textElements = container.querySelectorAll('h1, h2, h3, h4, h5, b, strong, [class*="title"], [class*="name"]');
          for (const el of textElements) {
            const text = el.textContent?.trim();
            if (text && text.length > 3 && text.length < 60) {
              name = text;
              break;
            }
          }
        }
        
        // Skip if no name found
        if (!name) {
          continue;
        }
        
        console.log(`Processing generic product: ${name}`);
        
        // 2. Price - extract from text
        let price = null;
        const priceMatch = allText.match(/(\d+)[\s:,.]?(\d*)\s*(kr|:-)/i);
        
        if (priceMatch) {
          const mainNumber = parseInt(priceMatch[1]);
          const decimal = priceMatch[2] ? parseInt(priceMatch[2]) : 0;
          
          if (decimal > 0) {
            price = parseFloat(`${mainNumber}.${decimal}`);
          } else {
            price = mainNumber;
          }
        }
        
        // Skip if no price found
        if (price === null) {
          continue;
        }
        
        // 3. Image
        let imageUrl = '';
        const images = container.querySelectorAll('img');
        
        for (const img of images) {
          const src = img.getAttribute('src') || img.getAttribute('data-src');
          if (src && !src.includes('logo') && !src.includes('icon')) {
            imageUrl = normalizeImageUrl(src, baseUrl);
            break;
          }
        }
        
        // 4. Description - try to find text that looks like a description
        let description = '';
        
        // Look for comparison price
        const comparisonMatch = allText.match(/jämförpris:?\s*([\d,.]+)\s*kr\/([a-zA-Z]+)/i);
        if (comparisonMatch) {
          description = `Jämförpris: ${comparisonMatch[1]} kr/${comparisonMatch[2]}`;
        } else {
          // Otherwise, look for other descriptive text
          const descElements = container.querySelectorAll('p, [class*="desc"], [class*="info"], [class*="details"]');
          
          for (const el of descElements) {
            const text = el.textContent?.trim();
            if (text && text !== name && text.length > 5 && !text.match(/\d+[\s:,.]?\d*\s*(kr|:-)/i)) {
              description = text;
              break;
            }
          }
        }
        
        // 5. Offer details
        let offerDetails = '';
        
        // Look for text that indicates an offer
        const offerMatch = allText.match(/(spara|rabatt|erbjudande|kampanj|rea)[\s:]+([\d]+)([%kr:-])/i);
        if (offerMatch) {
          offerDetails = offerMatch[0];
        } else {
          // Default offer text
          offerDetails = storeName ? `${storeName} erbjudande` : 'Veckans erbjudande';
        }
        
        // Add product to list
        products.push({
          name,
          price,
          description: description || null,
          image_url: imageUrl || 'https://assets.icanet.se/t_product_large_v1,f_auto/7300156501245.jpg',
          offer_details: offerDetails,
          store_name: storeNameFormatted
        });
        
        console.log(`Added generic product: ${name}, price: ${price}`);
      } catch (containerError) {
        console.error("Error processing product container:", containerError);
      }
    }
    
    console.log(`Successfully extracted ${products.length} generic products`);
    return products;
  } catch (error) {
    console.error("Error extracting generic products:", error);
    return [];
  }
}
