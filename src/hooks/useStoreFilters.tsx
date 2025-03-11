
import { useState, useEffect } from "react";

export const useStoreFilters = (initialStores: string[]) => {
  const [activeStores, setActiveStores] = useState<string[]>(initialStores);
  
  const handleRemoveTag = (id: string) => {
    setActiveStores(prev => prev.filter(storeId => storeId !== id));
  };

  const handleStoreToggle = (storeId: string) => {
    setActiveStores(prev => {
      if (prev.includes(storeId)) {
        return prev.filter(id => id !== storeId);
      } else {
        return [...prev, storeId];
      }
    });
  };
  
  // Add ICA store tag if needed
  const addIcaStoreIfNeeded = (products: any[], storeTagsData: any[]) => {
    if (products && products.length > 0) {
      // Check if ICA store tag already exists
      const icaTagExists = storeTagsData.some(store => store.id === 'ica');
      if (!icaTagExists) {
        // Add ICA store tag to active stores if it doesn't exist
        setActiveStores(prev => [...prev, 'ica']);
      }
    }
  };
  
  return { 
    activeStores, 
    handleRemoveTag, 
    handleStoreToggle,
    addIcaStoreIfNeeded
  };
};
