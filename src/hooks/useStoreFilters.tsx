
import { useState } from "react";

export const useStoreFilters = (initialStores: string[] = []) => {
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
  
  // Add store tag if needed
  const addStoreIfNeeded = (storeId: string, storeName: string, storeTagsData: any[]) => {
    // Check if store tag already exists
    const tagExists = storeTagsData.some(store => store.id === storeId);
    if (!tagExists) {
      // Add new store to storeTagsData
      storeTagsData.push({
        id: storeId,
        name: storeName
      });
      
      // Add to active stores if it doesn't exist
      setActiveStores(prev => {
        if (!prev.includes(storeId)) {
          return [...prev, storeId];
        }
        return prev;
      });
    }
  };
  
  return { 
    activeStores, 
    handleRemoveTag, 
    handleStoreToggle,
    addStoreIfNeeded
  };
};
