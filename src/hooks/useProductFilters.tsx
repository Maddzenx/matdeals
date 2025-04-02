
import { useState, useCallback } from 'react';
import { Product } from '@/data/types';

export function useProductFilters() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');

  const filterProductsByCategory = useCallback((products: Product[] | undefined) => {
    if (!products || products.length === 0) return [];
    if (activeCategory === 'all') return products;
    return products.filter(product => product.category === activeCategory);
  }, [activeCategory]);

  const filterProductsBySearch = useCallback((products: Product[] | undefined) => {
    if (!products || products.length === 0) return [];
    if (!searchQuery.trim()) return products;
    const query = searchQuery.toLowerCase();
    return products.filter(product => 
      product.name?.toLowerCase().includes(query) || 
      product.details?.toLowerCase().includes(query)
    );
  }, [searchQuery]);

  const filterProductsByStore = useCallback((products: Product[] | undefined, activeStores: string[]) => {
    if (!products || products.length === 0) return [];
    if (activeStores.length === 0) return products;
    return products.filter(product => 
      activeStores.some(storeId => 
        product.store?.toLowerCase() === storeId.toLowerCase()
      )
    );
  }, []);

  const applyAllFilters = useCallback((products: Product[] | undefined, activeStores: string[]) => {
    return filterProductsByStore(
      filterProductsByCategory(
        filterProductsBySearch(products)
      ),
      activeStores
    );
  }, [filterProductsByStore, filterProductsByCategory, filterProductsBySearch]);

  return {
    searchQuery,
    setSearchQuery,
    activeCategory,
    setActiveCategory,
    applyAllFilters
  };
}
