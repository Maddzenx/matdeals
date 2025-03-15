
// Function to extract products from the Willys webpage
export function extractProducts(document: Document, baseUrl: string) {
  console.log("Starting product extraction from Willys webpage");
  
  const products = [];
  
  try {
    // Try multiple extraction strategies
    
    // Strategy 1: Look for offer cards in the weekly offers section
    console.log("Trying strategy 1: Weekly offers");
    const offerCards = document.querySelectorAll('.js-product-offer-card, .product-offer-card, .product-card');
    
    if (offerCards && offerCards.length > 0) {
      console.log(`Found ${offerCards.length} offer cards in the weekly offers section`);
      
      for (let i = 0; i < offerCards.length; i++) {
        const card = offerCards[i];
        
        try {
          // Extract product information
          const nameElement = card.querySelector('.product-card__name, .js-product-name, .product-name, h3');
          const name = nameElement ? nameElement.textContent?.trim() : null;
          
          const priceElement = card.querySelector('.product-card__price, .js-product-price, .product-price, .price');
          const priceText = priceElement ? priceElement.textContent?.trim() : null;
          
          // Extract numeric price
          let price = null;
          if (priceText) {
            const priceMatch = priceText.match(/(\d+)[,.]?(\d*)/);
            if (priceMatch) {
              price = parseInt(priceMatch[1]);
            }
          }
          
          const imageElement = card.querySelector('img');
          const imageUrl = imageElement ? imageElement.getAttribute('src') : null;
          
          const descriptionElement = card.querySelector('.product-card__description, .js-product-description, .product-description');
          const description = descriptionElement ? descriptionElement.textContent?.trim() : null;
          
          const offerElement = card.querySelector('.badge, .offer-badge, .js-offer-badge');
          const offerDetails = offerElement ? offerElement.textContent?.trim() : "Erbjudande";
          
          if (name) {
            products.push({
              name,
              price,
              description: description || `${name}`,
              image_url: imageUrl && imageUrl.startsWith('http') ? imageUrl : (imageUrl ? `${baseUrl}${imageUrl}` : null),
              offer_details: offerDetails
            });
            
            console.log(`Extracted product: ${name} with price: ${price}`);
          }
        } catch (error) {
          console.error("Error extracting individual product:", error);
        }
      }
    }
    
    // Strategy 2: Look for product grid items (used in search results and category pages)
    if (products.length === 0) {
      console.log("Trying strategy 2: Product grid items");
      const productItems = document.querySelectorAll('.product-grid-item, .product-list-item, .grid-item, .product');
      
      if (productItems && productItems.length > 0) {
        console.log(`Found ${productItems.length} product grid items`);
        
        for (let i = 0; i < productItems.length; i++) {
          const item = productItems[i];
          
          try {
            const nameElement = item.querySelector('h3, .name, .product-name, .title');
            const name = nameElement ? nameElement.textContent?.trim() : null;
            
            const priceElement = item.querySelector('.price, .product-price, .offer-price');
            const priceText = priceElement ? priceElement.textContent?.trim() : null;
            
            // Extract numeric price
            let price = null;
            if (priceText) {
              const priceMatch = priceText.match(/(\d+)[,.]?(\d*)/);
              if (priceMatch) {
                price = parseInt(priceMatch[1]);
              }
            }
            
            const imageElement = item.querySelector('img');
            const imageUrl = imageElement ? imageElement.getAttribute('src') : null;
            
            const descriptionElement = item.querySelector('.description, .product-description, .details');
            const description = descriptionElement ? descriptionElement.textContent?.trim() : null;
            
            if (name) {
              products.push({
                name,
                price,
                description: description || `${name}`,
                image_url: imageUrl && imageUrl.startsWith('http') ? imageUrl : (imageUrl ? `${baseUrl}${imageUrl}` : null),
                offer_details: "Erbjudande"
              });
              
              console.log(`Extracted product: ${name} with price: ${price}`);
            }
          } catch (error) {
            console.error("Error extracting individual product in strategy 2:", error);
          }
        }
      }
    }
    
    // Strategy 3: Generic elements with product attributes
    if (products.length === 0) {
      console.log("Trying strategy 3: Generic elements with product attributes");
      // Look for any element with class or attributes related to products
      const possibleProductElements = document.querySelectorAll('[class*="product"], [id*="product"], [class*="offer"], [class*="campaign"]');
      
      if (possibleProductElements && possibleProductElements.length > 0) {
        console.log(`Found ${possibleProductElements.length} possible product elements`);
        
        for (let i = 0; i < possibleProductElements.length; i++) {
          const element = possibleProductElements[i];
          
          try {
            // Skip if this is a container and not an actual product
            if (element.children.length > 10) continue;
            
            const nameElement = element.querySelector('h2, h3, h4, [class*="name"], [class*="title"]');
            const name = nameElement ? nameElement.textContent?.trim() : null;
            
            if (!name || name.length < 3) continue; // Skip if no valid name found
            
            const priceElement = element.querySelector('[class*="price"]');
            const priceText = priceElement ? priceElement.textContent?.trim() : null;
            
            // Extract numeric price
            let price = null;
            if (priceText) {
              const priceMatch = priceText.match(/(\d+)[,.]?(\d*)/);
              if (priceMatch) {
                price = parseInt(priceMatch[1]);
              }
            }
            
            const imageElement = element.querySelector('img');
            const imageUrl = imageElement ? imageElement.getAttribute('src') : null;
            
            if (name && price) {
              products.push({
                name,
                price,
                description: `${name}`,
                image_url: imageUrl && imageUrl.startsWith('http') ? imageUrl : (imageUrl ? `${baseUrl}${imageUrl}` : null),
                offer_details: "Erbjudande"
              });
              
              console.log(`Extracted product from generic element: ${name} with price: ${price}`);
            }
          } catch (error) {
            console.error("Error extracting individual product in strategy 3:", error);
          }
        }
      }
    }
    
    // Log the results
    console.log(`Total products extracted: ${products.length}`);
    if (products.length > 0) {
      console.log("First product:", products[0]);
    }
    
    return products;
  } catch (error) {
    console.error("Error during product extraction:", error);
    return [];
  }
}
