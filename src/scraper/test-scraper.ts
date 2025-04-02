import { MatprisScraper } from './new-scraper.js';

async function main() {
  try {
    const scraper = new MatprisScraper();

    // Test region fetching
    console.log('\nTesting region fetching:');
    const regions = await scraper.getRegions();
    console.log('Regions:', regions);

    // Test store fetching for Stockholm region
    console.log('\nTesting store fetching for Stockholm region:');
    const stockholmRegion = regions.find(r => r.code === 'SE-AB');
    if (!stockholmRegion) {
      throw new Error('Could not find Stockholm region');
    }
    const stores = await scraper.getStores(stockholmRegion.code);
    console.log('Stores:', stores);

    // Test category fetching
    console.log('\nTesting category fetching:');
    const categories = await scraper.getCategories();
    console.log('Categories:', categories);

    // Try different store and category
    console.log('\nTesting product fetching for store and category:');
    // Use ICA Farsta store
    const testStoreId = 'e5537b20-7980-45d7-805f-e80bd5f33c7c'; // Farsta store
    const testRegionCode = 'SE-AB'; // Stockholm region
    
    // Try Skafferi category
    const skafferiCategory = categories.find(c => c.name === 'Skafferi');
    if (!skafferiCategory) {
      throw new Error('Could not find Skafferi category');
    }
    
    console.log(`Testing product fetching for store Farsta and category Skafferi...`);
    const products = await scraper.getProducts(testStoreId, testRegionCode, skafferiCategory.id);
    console.log('Products:', products);
  } catch (error) {
    console.error('Error:', error);
  }
}

main(); 