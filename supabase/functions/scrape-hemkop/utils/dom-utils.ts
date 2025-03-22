
import { DOMParser } from "https://deno.land/x/deno_dom/deno-dom-wasm.ts";

// Function to fetch HTML content with multiple retry strategies
export async function fetchHtmlContent(
  urls: string[], 
  userAgents: string[], 
  forceRefresh: boolean = false
): Promise<{document: Document | null, html: string, fetchSuccess: boolean}> {
  let html = '';
  let fetchSuccess = false;
  let document = null;
  
  for (const url of urls) {
    for (const userAgent of userAgents) {
      try {
        console.log(`Fetching from: ${url} with User-Agent: ${userAgent.substring(0, 20)}...`);
        const response = await fetch(url, {
          headers: {
            'User-Agent': userAgent,
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
            'Accept-Language': 'sv-SE,sv;q=0.9,en-US;q=0.8,en;q=0.7',
            'Cache-Control': forceRefresh ? 'no-cache' : 'max-age=0',
            'Pragma': forceRefresh ? 'no-cache' : '',
            'Referer': 'https://www.hemkop.se/',
            'Connection': 'keep-alive',
            'Upgrade-Insecure-Requests': '1',
            'Sec-Fetch-Dest': 'document',
            'Sec-Fetch-Mode': 'navigate',
            'Sec-Fetch-Site': 'same-origin',
            'Sec-Fetch-User': '?1'
          },
          redirect: 'follow'
        });
        
        if (response.ok) {
          html = await response.text();
          console.log(`Successfully fetched from ${url}, received ${html.length} characters`);
          
          // Log a short preview to debug content structure
          if (html.length > 100) {
            console.log(`Preview of HTML: ${html.substring(0, 500)}...`);
            
            // Check for any signs this is actually the content we want
            const hasProducts = html.includes('produkt') || html.includes('erbjudande') || 
                               html.includes('pris') || html.includes('kampanj');
            
            if (hasProducts) {
              console.log("Found product-related content in HTML");
            } else {
              console.log("Warning: No obvious product-related content found in HTML");
            }
          }
          
          // If we got a valid HTML response, parse it
          if (html.length > 1000) {
            // Parse the HTML
            const parser = new DOMParser();
            document = parser.parseFromString(html, "text/html");
            
            if (document) {
              console.log("Successfully parsed HTML document");
              
              // Try different approaches to find product containers
              const approaches = [
                // Approach 1: Standard product selectors
                () => document?.querySelectorAll('.product, .product-card, [class*="product"], article, .offer, .campaign-item'),
                // Approach 2: Price-related elements
                () => document?.querySelectorAll('[class*="price"], [class*="Price"], [class*="kr"], [class*="erbjudande"]'),
                // Approach 3: Generic containers with images
                () => document?.querySelectorAll('div > img, a > img'),
                // Approach 4: List items with price text (common pattern)
                () => {
                  const allListItems = document?.querySelectorAll('li');
                  return Array.from(allListItems || []).filter(el => 
                    el.textContent?.includes('kr') || el.textContent?.includes(':-')
                  );
                },
                // Approach 5: Div containers with product-like structure
                () => {
                  const divs = document?.querySelectorAll('div');
                  return Array.from(divs || []).filter(div => {
                    const hasImg = div.querySelector('img') !== null;
                    const hasPriceText = div.textContent?.match(/\d+[,.:]?\d*\s*kr/) !== null;
                    return hasImg && hasPriceText;
                  });
                }
              ];
              
              // Try each approach
              for (const approachFn of approaches) {
                const elements = approachFn();
                console.log(`Found ${elements?.length || 0} potential product elements with approach`);
                
                if (elements && elements.length > 3) {
                  console.log("This approach found multiple elements - likely product containers");
                  fetchSuccess = true;
                  break;
                }
              }
              
              if (fetchSuccess) {
                break;
              } else {
                console.log("Could not find product elements with any approach, trying next URL");
              }
            }
          } else {
            console.log("HTML response too short or invalid");
          }
        } else {
          console.log(`Failed to fetch from ${url} with status: ${response.status}`);
        }
      } catch (fetchError) {
        console.error(`Error fetching from ${url} with User-Agent ${userAgent.substring(0, 20)}:`, fetchError);
      }
    }
    
    if (fetchSuccess && document) {
      break;
    }
  }
  
  return { document, html, fetchSuccess };
}
