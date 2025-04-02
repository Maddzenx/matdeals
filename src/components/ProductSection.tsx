import React, { useState } from 'react';
import { Product } from '../types/product';
import { Card, CardContent } from './ui/card';

interface ProductSectionProps {
  title: string;
  products: Product[];
  stores?: string[];
  categories?: { id: string; name: string }[];
  storeTags?: { id: string; name: string }[];
  activeStoreIds?: string[];
  onProductQuantityChange?: (
    productId: string, 
    newQuantity: number, 
    previousQuantity: number,
    productDetails?: {
      name: string;
      details: string;
      price: string;
      image?: string;
      store?: string;
    }
  ) => void;
  onRemoveTag?: (id: string) => void;
  viewMode?: "grid" | "list";
  searchQuery?: string;
  supabaseProducts?: any[];
}

const ProductSection: React.FC<ProductSectionProps> = ({ 
  title, 
  products,
  stores = [],
  categories,
  storeTags,
  activeStoreIds,
  onProductQuantityChange,
  onRemoveTag,
  viewMode,
  searchQuery,
  supabaseProducts
}) => {
  const [selectedStore, setSelectedStore] = useState<string>('all');
  
  // Filter products by selected store if needed
  const filteredProducts = selectedStore === 'all' 
    ? products 
    : products.filter(p => p.store === selectedStore);
  
  // Group products by category for better organization
  const groupedProducts: Record<string, Product[]> = {};
  
  filteredProducts.forEach(product => {
    const category = product.category || 'Other';
    if (!groupedProducts[category]) {
      groupedProducts[category] = [];
    }
    groupedProducts[category].push(product);
  });
  
  // Get categories
  const categories = Object.keys(groupedProducts).sort();
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">{title}</h2>
        
        {stores.length > 0 && (
          <select 
            value={selectedStore} 
            onChange={(e) => setSelectedStore(e.target.value)}
            className="border rounded px-3 py-1 text-sm"
          >
            <option value="all">All Stores</option>
            {stores.map(store => (
              <option key={store} value={store}>{store}</option>
            ))}
          </select>
        )}
      </div>
      
      {categories.length === 0 ? (
        <p className="text-gray-500">No products found</p>
      ) : (
        <div className="space-y-8">
          {categories.map(category => (
            <div key={category} className="space-y-4">
              <h3 className="text-xl font-semibold">{category}</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {groupedProducts[category].map(product => (
                  <Card key={product.id} className="hover:shadow-lg transition-shadow">
                    <CardContent className="p-4">
                      <div className="font-medium">{product.name}</div>
                      <div className="text-lg font-bold">{product.price}</div>
                      <div className="text-sm text-gray-500">{product.store}</div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProductSection;
