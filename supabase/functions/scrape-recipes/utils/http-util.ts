
import { DOMParser } from "https://deno.land/x/deno_dom@v0.1.38/deno-dom-wasm.ts";

// CORS headers for browser requests
export const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Enhanced fetch with retries and user agent rotation
export async function enhancedFetch(url: string, retries = 3): Promise<Response> {
  const userAgents = [
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.1.1 Safari/605.1.15",
    "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/92.0.4515.107 Safari/537.36"
  ];
  
  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      const userAgent = userAgents[Math.floor(Math.random() * userAgents.length)];
      console.log(`Attempt ${attempt + 1} fetching: ${url} with user agent: ${userAgent.substring(0, 20)}...`);
      
      const response = await fetch(url, {
        headers: {
          "User-Agent": userAgent,
          "Accept": "text/html,application/xhtml+xml,application/xml",
          "Accept-Language": "en-US,en;q=0.9,sv;q=0.8",
          "Cache-Control": "no-cache"
        },
      });
      
      if (!response.ok) {
        const statusText = await response.text();
        console.error(`HTTP error: ${response.status} ${response.statusText}. First 100 chars: ${statusText.substring(0, 100)}`);
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      return response;
    } catch (error) {
      console.error(`Attempt ${attempt + 1} failed:`, error);
      if (attempt === retries - 1) throw error;
      // Wait a bit before retrying
      await new Promise(r => setTimeout(r, 1000 * (attempt + 1)));
    }
  }
  
  throw new Error("All fetch attempts failed");
}

// Fetch and parse HTML
export async function fetchAndParse(url: string) {
  try {
    console.log(`Fetching URL: ${url}`);
    const response = await enhancedFetch(url);
    
    const html = await response.text();
    
    // Log a small sample of the HTML to debug
    console.log(`HTML sample (first 300 chars): ${html.substring(0, 300)}...`);
    
    const parser = new DOMParser();
    const document = parser.parseFromString(html, "text/html");
    
    if (!document) {
      throw new Error("Failed to parse HTML document");
    }
    
    return document;
  } catch (error) {
    console.error(`Error fetching ${url}:`, error);
    throw error;
  }
}
