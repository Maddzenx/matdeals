
// Extractor for weekly offers
import { ExtractorResult, normalizeImageUrl, extractPrice } from "./base-extractor.ts";

export function extractWeeklyOffers(document: Document, baseUrl: string, storeName?: string): ExtractorResult[] {
  console.log("Looking for weekly offers in the HTML");
  
  const products: ExtractorResult[] = [];
  const storeNameFormatted = storeName?.toLowerCase() || 'willys';
  
  try {
    // Select offer card containers
    const offerCardSelectors = [
      '.offer-card', '[class*="offer-card"]', '.product-card', '[class*="product-card"]',
      '.campaign-product', '[class*="campaign"]', '[class*="Campaign"]',
      '.item-card', '.offer-item', '[data-test-id*="product"]', '[data-test-id*="offer"]',
      'article', 'li[class*="product"]', 'div[class*="product-item"]'
    ];
    
    // Try each selector until we find offer cards
    let offerCards: Element[] = [];
    
    for (const selector of offerCardSelectors) {
      const cards = document.querySelectorAll(selector);
      if (cards && cards.length > 0) {
        console.log(`Found ${cards.length} offer cards with selector: ${selector}`);
        offerCards = Array.from(cards);
        break;
      }
    }
    
    if (offerCards.length === 0) {
      console.log("No offer cards found");
      return [];
    }
    
    console.log(`Processing ${offerCards.length} offer cards`);
    
    for (const card of offerCards) {
      try {
        // Skip cards without enough content
        if (!card.textContent || card.textContent.trim().length < 10) {
          continue;
        }
        
        // Extract product details
        
        // 1. Name - look for headings first
        let name = '';
        const nameElements = card.querySelectorAll('h1, h2, h3, h4, h5, [class*="title"], [class*="name"], b, strong');
        
        for (const el of nameElements) {
          const text = el.textContent?.trim();
          if (text && text.length > 2 && text.length < 100) {
            name = text;
            break;
          }
        }
        
        // If no name found using heading elements, try other text elements
        if (!name) {
          // Try to find the most prominent text element in the card
          const textElements = card.querySelectorAll('p, div, span');
          
          for (const el of textElements) {
            const text = el.textContent?.trim();
            if (text && text.length > 2 && text.length < 50 && !text.includes('kr/') && !text.match(/^\d+[\s:,.]?\d*(\s*kr)?$/)) {
              name = text;
              break;
            }
          }
        }
        
        // Skip if no name found
        if (!name) {
          console.log("Skipping card - could not find product name");
          continue;
        }
        
        console.log(`Processing offer: ${name}`);
        
        // 2. Price - look for price elements
        let price = null;
        const priceElements = card.querySelectorAll('[class*="price"], [class*="Price"], .pris, .discount');
        
        for (const el of priceElements) {
          const priceText = el.textContent?.trim();
          if (priceText && priceText.match(/\d+/)) {
            const extractedPrice = extractPrice(priceText);
            if (extractedPrice !== null) {
              price = extractedPrice;
              break;
            }
          }
        }
        
        // If no price found using price classes, look for any numeric text that could be a price
        if (price === null) {
          const allText = card.textContent || '';
          const priceMatches = allText.match(/(\d+)[\s:,.]?(\d*)\s*kr/);
          
          if (priceMatches) {
            const mainNumber = parseInt(priceMatches[1]);
            const decimal = priceMatches[2] ? parseInt(priceMatches[2]) : 0;
            
            if (decimal > 0) {
              price = parseFloat(`${mainNumber}.${decimal}`);
            } else {
              price = mainNumber;
            }
          }
        }
        
        // 3. Image
        let imageUrl = '';
        const images = card.querySelectorAll('img');
        
        for (const img of images) {
          const src = img.getAttribute('src') || img.getAttribute('data-src');
          if (src && !src.includes('logo') && !src.includes('icon')) {
            imageUrl = normalizeImageUrl(src, baseUrl);
            break;
          }
        }
        
        // 4. Description / additional info
        let description = '';
        const descElements = card.querySelectorAll('[class*="desc"], [class*="info"], [class*="details"], p');
        
        for (const el of descElements) {
          const text = el.textContent?.trim();
          if (text && text !== name && text.length > 5 && !text.match(/\d+[\s:,.]?\d*\s*kr/) && !el.querySelector('img')) {
            description = text;
            break;
          }
        }
        
        // 5. Offer details
        let offerDetails = '';
        const offerElements = card.querySelectorAll('[class*="campaign"], [class*="offer"], [class*="saving"], [class*="discount"]');
        
        for (const el of offerElements) {
          const text = el.textContent?.trim();
          if (text && text.length > 2 && text !== name && text !== description) {
            offerDetails = text;
            break;
          }
        }
        
        // If no offer details found, use a default
        if (!offerDetails) {
          offerDetails = storeName ? `${storeName} erbjudande` : 'Veckans erbjudande';
        }
        
        // Add product to list if we have at least a name and price
        if (name && price !== null) {
          products.push({
            name,
            price,
            description: description || null,
            image_url: imageUrl || 'https://assets.icanet.se/t_product_large_v1,f_auto/7300156501245.jpg',
            offer_details: offerDetails,
            store_name: storeNameFormatted
          });
          
          console.log(`Added product: ${name}, price: ${price}`);
        }
      } catch (cardError) {
        console.error("Error processing offer card:", cardError);
      }
    }
    
    console.log(`Successfully extracted ${products.length} weekly offers`);
    return products;
  } catch (error) {
    console.error("Error extracting weekly offers:", error);
    return [];
  }
}
