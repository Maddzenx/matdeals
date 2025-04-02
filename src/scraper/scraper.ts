import axios from 'axios';
import * as cheerio from 'cheerio';
import { Product, Store, Municipality, Region } from './types';

const BASE_URL = 'https://web.matpriskollen.se';

export class MatprisScraper {
  private async fetchPage(url: string): Promise<string> {
    try {
      const response = await axios.get(url, {
        headers: {
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:109.0) Gecko/20100101 Firefox/119.0'
        }
      });
      return response.data;
    } catch (error) {
      console.error(`Error fetching ${url}:`, error);
      throw error;
    }
  }

  private parseRegions(html: string): Region[] {
    const $ = cheerio.load(html);
    const regions: Region[] = [];

    // Find all region links
    $('a[href^="/Store/ListByRegion"]').each((_, element) => {
      const href = $(element).attr('href') || '';
      const code = new URLSearchParams(href.split('?')[1]).get('code') || '';
      const name = $(element).text().trim();
      
      regions.push({
        id: code,
        name,
        municipalities: []
      });
    });

    return regions;
  }

  private parseStores(html: string): Store[] {
    const $ = cheerio.load(html);
    const stores: Store[] = [];

    // Find all store cards
    $('.card.h-100.text-center').each((_, element) => {
      const $card = $(element);
      const name = $card.find('.card-text').text().trim();
      const selectLink = $card.find('a[href^="/Store/Select"]').attr('href') || '';
      const storeId = new URLSearchParams(selectLink.split('?')[1]).get('key') || '';
      const logoUrl = $card.find('.storebox__image').attr('src') || '';
      const chainName = logoUrl.split('/').pop()?.split('.')[0] || '';
      
      if (name && storeId) {
        stores.push({
          id: storeId,
          name,
          address: '', // Address is not available in the new format
          chainName,
          products: []
        });
      }
    });

    return stores;
  }

  async getRegions(): Promise<Region[]> {
    console.log('Fetching regions...');
    const html = await this.fetchPage(`${BASE_URL}/Store/Regions`);
    return this.parseRegions(html);
  }

  async getStoresByRegion(regionCode: string): Promise<Store[]> {
    console.log(`Fetching stores for region ${regionCode}...`);
    try {
      const html = await this.fetchPage(`${BASE_URL}/Store/ListByRegion?code=${regionCode}`);
      return this.parseStores(html);
    } catch (error) {
      console.error(`Error fetching stores for region ${regionCode}:`, error);
      return [];
    }
  }

  async getStoreDetails(storeId: string): Promise<Store> {
    console.log(`Fetching details for store ${storeId}...`);
    try {
      // First, get the store page to get any necessary tokens
      const html = await this.fetchPage(`${BASE_URL}/Store/Details/${storeId}`);
      
      // Parse the store details from the HTML
      const $ = cheerio.load(html);
      const name = $('.store-name').text().trim();
      const address = $('.store-address').text().trim();
      const products: Product[] = [];

      // Parse products from the product table
      $('.product-table tr').each((_, element) => {
        const $row = $(element);
        const productName = $row.find('.product-name').text().trim();
        const priceText = $row.find('.price').text().trim();
        const price = parseFloat(priceText.replace('kr', '').replace(',', '.').trim());
        const unit = $row.find('.unit').text().trim();
        const lastUpdated = $row.find('.last-updated').text().trim();

        if (productName && !isNaN(price)) {
          products.push({
            name: productName,
            price,
            unit: unit || undefined,
            lastUpdated: lastUpdated || new Date().toISOString()
          });
        }
      });

      return {
        id: storeId,
        name: name || 'Unknown Store',
        address: address || '',
        products
      };
    } catch (error) {
      console.error(`Error fetching store details for ${storeId}:`, error);
      throw error;
    }
  }

  // Helper method to scrape a single store with all its details
  async scrapeSingleStore(storeId: string): Promise<Store> {
    return this.getStoreDetails(storeId);
  }
} 