
import { useEffect } from "react";
import { storeTagsData } from "@/data/productData";

export const useInitialStoreSetup = (
  activeStores: string[],
  addStoreIfNeeded: (storeId: string, storeName: string, storeTagsData: any[]) => void,
  handleStoreToggle: (storeId: string) => void,
  supabaseProducts: any[]
) => {
  // Initialize store filters
  useEffect(() => {
    // Make sure all stores are available in the store filter by default
    addStoreIfNeeded('ica', 'ICA', storeTagsData);
    addStoreIfNeeded('willys', 'Willys', storeTagsData);
    addStoreIfNeeded('hemkop', 'Hemköp', storeTagsData);
    
    // Make sure all stores are selected by default
    if (!activeStores.includes('ica')) {
      handleStoreToggle('ica');
    }
    if (!activeStores.includes('willys')) {
      handleStoreToggle('willys');
    }
    if (!activeStores.includes('hemkop')) {
      handleStoreToggle('hemkop');
    }
  }, []);
  
  // Add store filters based on product data
  useEffect(() => {
    if (supabaseProducts && supabaseProducts.length > 0) {
      console.log(`Loaded ${supabaseProducts.length} products from Supabase`);
      
      // Count products by store
      const storeCount = supabaseProducts.reduce((acc, product) => {
        const store = product.store?.toLowerCase() || 'unknown';
        acc[store] = (acc[store] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
      
      console.log("Products by store:", storeCount);
      
      // Make sure store filters are available for all stores in the data
      Object.keys(storeCount).forEach(store => {
        if (store !== 'unknown') {
          const storeName = store === 'ica' ? 'ICA' : 
                           store === 'willys' ? 'Willys' : 
                           store === 'hemkop' ? 'Hemköp' :
                           store.charAt(0).toUpperCase() + store.slice(1);
          addStoreIfNeeded(store, storeName, storeTagsData);
        }
      });
    }
  }, [supabaseProducts, addStoreIfNeeded]);
};
