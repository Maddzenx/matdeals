
import { Region, Municipality, Store, Product } from './types';

// Function to fetch and parse the regions
export async function fetchRegions(): Promise<Region[]> {
  try {
    // This is just a placeholder implementation
    console.log('Fetching regions...');
    
    // Return some mock data
    return [
      {
        id: '1',
        code: 'SE-01',
        name: 'Stockholm',
        municipalities: []
      },
      {
        id: '2',
        code: 'SE-02',
        name: 'Göteborg',
        municipalities: []
      }
    ];
  } catch (error) {
    console.error('Error fetching regions:', error);
    return [];
  }
}

// Function to fetch municipalities for a region
export async function fetchMunicipalities(regionId: string): Promise<Municipality[]> {
  try {
    console.log(`Fetching municipalities for region ${regionId}...`);
    
    // Return some mock data
    return [
      {
        id: '101',
        name: 'Stockholm City',
        stores: []
      },
      {
        id: '102',
        name: 'Solna',
        stores: []
      }
    ];
  } catch (error) {
    console.error(`Error fetching municipalities for region ${regionId}:`, error);
    return [];
  }
}

// Function to fetch stores for a municipality
export async function fetchStores(municipalityId: string): Promise<Store[]> {
  try {
    console.log(`Fetching stores for municipality ${municipalityId}...`);
    
    // Return some mock data
    return [
      {
        id: '1001',
        name: 'ICA Maxi',
        address: 'Solnavägen 1',
        chainName: 'ICA',
        regionCode: 'SE-01',
        products: []
      },
      {
        id: '1002',
        name: 'Willys',
        address: 'Solnavägen 2',
        chainName: 'Willys',
        regionCode: 'SE-01',
        products: []
      }
    ];
  } catch (error) {
    console.error(`Error fetching stores for municipality ${municipalityId}:`, error);
    return [];
  }
}

// Function to fetch products for a store
export async function fetchProducts(storeId: string): Promise<Product[]> {
  try {
    console.log(`Fetching products for store ${storeId}...`);
    
    // Return some mock data
    return [
      {
        name: 'Mjölk',
        price: 12.90,
        unit: 'l',
        store: 'ICA',
        category: 'Mejeriprodukter'
      },
      {
        name: 'Bröd',
        price: 24.90,
        unit: 'st',
        store: 'ICA',
        category: 'Bröd'
      }
    ];
  } catch (error) {
    console.error(`Error fetching products for store ${storeId}:`, error);
    return [];
  }
}

// Function to create a store object with products
export function createStoreWithProducts(
  id: string,
  name: string,
  address: string,
  chainName: string,
  regionCode: string,
  products: Product[]
): Store {
  return {
    id,
    name,
    address,
    chainName,
    regionCode,
    products
  };
}
