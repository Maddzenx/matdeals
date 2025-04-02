import { load } from 'cheerio';
import axios from 'axios';
import { Product, Store, Municipality, Region } from './types.js';
import * as cheerio from 'cheerio';

const BASE_URL = 'https://web.matpriskollen.se';

export class MatprisScraper {
  private axiosInstance = axios.create({
    baseURL: 'https://web.matpriskollen.se',
    withCredentials: true
  });

  private cookies: string[] = [];
  private baseUrl = 'https://web.matpriskollen.se';

  private async fetch(url: string, options: RequestInit = {}): Promise<Response> {
    const fullUrl = url.startsWith('http') ? url : `${this.baseUrl}${url}`;
    const headers = {
      'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.114 Safari/537.36',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
      'Accept-Language': 'en-US,en;q=0.5',
      'Origin': this.baseUrl,
      'Referer': `${this.baseUrl}/Store/ListByRegion`,
      ...(this.cookies.length > 0 ? { 'Cookie': this.cookies.join('; ') } : {}),
      ...options.headers,
    };

    const response = await fetch(fullUrl, {
      ...options,
      headers,
      redirect: 'manual',
    });

    const setCookie = response.headers.get('set-cookie');
    if (setCookie) {
      // Parse the Set-Cookie header
      const cookieValue = setCookie.split(';')[0];
      if (!this.cookies.includes(cookieValue)) {
        this.cookies.push(cookieValue);
      }
    }

    // If we get a redirect, follow it
    if (response.status === 302) {
      const location = response.headers.get('location');
      if (location) {
        return this.fetch(location);
      }
    }

    return response;
  }

  private parseRegions(html: string): Region[] {
    const regions: Region[] = [];
    const $ = cheerio.load(html);

    $('a[href^="/Store/ListByRegion"]').each((_: number, element) => {
      const href = $(element).attr('href') || '';
      const code = href.split('=').pop() || '';
      const name = $(element).text().trim();
      regions.push({
        id: code,
        code,
        name,
        municipalities: []
      });
    });

    return regions;
  }

  private parseStores(html: string, regionCode: string): Store[] {
    const stores: Store[] = [];
    const $ = cheerio.load(html);

    $('.card.h-100.text-center').each((_: number, element) => {
      const $card = $(element);
      const name = $card.find('.card-title').text().trim();
      const address = $card.find('.card-text').first().text().trim();
      const chainName = $card.find('.card-text').last().text().trim();
      const href = $card.find('a').attr('href') || '';
      const id = href.split('=')[1]?.split('&')[0] || '';

      stores.push({
        id,
        name,
        address,
        chainName,
        regionCode,
        products: []
      });
    });

    return stores;
  }

  private parseCategories(html: string): { id: string; name: string }[] {
    const categories: { id: string; name: string }[] = [];
    const $ = cheerio.load(html);

    $('a[href^="/Offer/ByCategory/"]').each((_: number, element) => {
      const $link = $(element);
      const href = $link.attr('href') || '';
      const id = href.split('/').pop() || '';
      const name = $link.text().trim();
      categories.push({ id, name });
    });

    return categories;
  }

  private parseProducts(html: string): Product[] {
    const products: Product[] = [];
    const $ = cheerio.load(html);

    // Check if there are no offers available
    if ($('div.col-9 p').text().trim() === 'Inga erbjudanden.') {
      console.log('No offers available for this store and category');
      return products;
    }

    // If we have offers, they will likely be in a card-based layout
    // This is placeholder code that will need to be updated once we see actual product listings
    $('.card').each((_: number, element) => {
      const $card = $(element);
      
      // These selectors will need to be updated based on the actual HTML structure
      const name = $card.find('h5.card-title').text().trim() || '';
      const priceText = $card.find('.price').text().trim() || '0';
      const price = parseFloat(priceText.replace(',', '.')) || 0;
      const unit = $card.find('.unit').text().trim() || '';
      const category = ''; // Category information would be set by the caller
      const store = ''; // Store information would be set by the caller
      
      // Only add products that have at least a name
      if (name) {
        products.push({
          name,
          price,
          unit,
          category,
          store,
          lastUpdated: new Date().toISOString()
        });
      }
    });

    return products;
  }

  private async selectStore(storeId: string, regionCode: string): Promise<void> {
    console.log(`Selecting store ${storeId} in region ${regionCode}...`);
    
    // First, visit the regions page to get any initial cookies
    await this.fetch('/Store/Regions');

    // Then, visit the region's store list page
    await this.fetch(`/Store/ListByRegion?code=${regionCode}`);

    // Finally, select the store
    const response = await this.fetch(`/Store/Select?key=${storeId}&code=${regionCode}`);
    
    if (!response.ok && response.status !== 302) {
      throw new Error(`Failed to select store: ${response.statusText}`);
    }

    // The store selection is successful if we got a cookie
    if (!this.cookies.some(cookie => cookie.includes('_SelectedStores'))) {
      throw new Error('Store selection failed: No store cookie set');
    }
  }

  async getProducts(storeId: string, regionCode: string, categoryId: string): Promise<Product[]> {
    try {
      await this.selectStore(storeId, regionCode);
      
      // After store selection, fetch the products using the new URL structure
      const response = await this.fetch(`/Offer/ByCategory/${categoryId}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch products: ${response.statusText}`);
      }

      const html = await response.text();
      const products = this.parseProducts(html);
      
      // Get store information
      const stores = await this.getStores(regionCode);
      const store = stores.find(s => s.id === storeId);
      
      // Get category information
      const categories = await this.getCategories();
      const category = categories.find(c => c.id === categoryId);
      
      // Set store and category information for each product
      return products.map(product => ({
        ...product,
        store: store?.name || store?.address || '',
        category: category?.name || ''
      }));
    } catch (error) {
      console.error('Error fetching products:', error);
      return [];
    }
  }

  async getRegions(): Promise<Region[]> {
    console.log('Fetching regions...');
    const response = await this.fetch('/Store/Regions');
    const html = await response.text();
    return this.parseRegions(html);
  }

  async getStores(regionCode: string): Promise<Store[]> {
    console.log(`Fetching stores for region ${regionCode}...`);
    const response = await this.fetch(`/Store/ListByRegion?code=${regionCode}`);
    const html = await response.text();
    return this.parseStores(html, regionCode);
  }

  async getCategories(): Promise<{ id: string; name: string }[]> {
    console.log('Fetching categories...');
    const response = await this.fetch('/Store/Regions');
    const html = await response.text();
    return this.parseCategories(html);
  }

  async getProductsByCategory(categoryId: string, store: Store): Promise<Product[]> {
    console.log(`Fetching products for category ${categoryId} from store ${store.name}...`);
    try {
      return await this.getProducts(store.id, store.regionCode, categoryId);
    } catch (error) {
      console.error(`Error fetching products for category ${categoryId} from store ${store.name}:`, error);
      return [];
    }
  }

  // Helper method to scrape all products from a store
  async scrapeStoreProducts(store: Store): Promise<Product[]> {
    console.log(`Scraping all products from store ${store.name}...`);
    const categories = await this.getCategories();
    const allProducts: Product[] = [];

    for (const category of categories) {
      const products = await this.getProductsByCategory(category.id, store);
      allProducts.push(...products);
    }

    return allProducts;
  }
} 