import { useState, useEffect } from 'react';
import { Recipe } from '@/types/recipe';
import { Product } from '@/types/product';
import { MatchedIngredient } from '@/types/matchedIngredient';

interface OfflineData {
  recipe: Recipe;
  matchedProducts: Product[];
  matchedIngredients: MatchedIngredient[];
}

export const useOfflineSupport = (type: 'recipe', id: string) => {
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [offlineData, setOfflineData] = useState<OfflineData | null>(null);

  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    if (isOffline) {
      const savedData = localStorage.getItem(`offline_${type}_${id}`);
      if (savedData) {
        setOfflineData(JSON.parse(savedData));
      }
    }
  }, [isOffline, type, id]);

  const saveOfflineData = (data: OfflineData) => {
    localStorage.setItem(`offline_${type}_${id}`, JSON.stringify(data));
    setOfflineData(data);
  };

  return { isOffline, offlineData, saveOfflineData };
}; 