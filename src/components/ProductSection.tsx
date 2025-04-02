
import React, { useState } from 'react';
import { Product } from '../types/product';
import { Card, CardContent } from './ui/card';
import { ProductCard } from './ProductCard';
import { useProductSection } from '@/hooks/useProductSection';
import { ProductSectionLayout } from './product-section/ProductSectionLayout';

interface ProductSectionProps {
  title?: string;
  products?: Product[];
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
  title = "Products", 
  products = [],
  stores = [],
  categories = [],
  storeTags = [],
  activeStoreIds = [],
  onProductQuantityChange,
  onRemoveTag,
  viewMode = "grid",
  searchQuery = "",
  supabaseProducts = []
}) => {
  const [selectedStore, setSelectedStore] = useState<string>('all');
  
  // If we have supabase products, transform them to match the Product interface
  const displayProducts = supabaseProducts.length > 0 
    ? supabaseProducts.map((product: any) => ({
        id: product.id || '',
        name: product.name || product.product_name || '',
        details: product.brand || product.additional_info || '',
        currentPrice: product.price || '',
        originalPrice: product.originalPriceText || product.original_price || '',
        category: product.category || 'Other',
        store: product.store || '',
        image: product.image || 'https://assets.icanet.se/t_product_large_v1,f_auto/7310865085313.jpg', // Default image
        offerBadge: 'Erbjudande'
      }))
    : products;
  
  // If we have categories from props, use those
  const defaultCategories = [
    { id: "all", name: "All" },
    { id: "fruits", name: "Fruit & Vegetables" },
    { id: "meat", name: "Meat" },
    { id: "dairy", name: "Dairy" },
    { id: "fish", name: "Fish" },
    { id: "bread", name: "Bread" },
    { id: "drinks", name: "Drinks" },
    { id: "other", name: "Other" }
  ];
  
  const productCategories = categories.length > 0 ? categories : defaultCategories;
  
  // Use the hook to manage filtering and category selection
  const {
    filteredProducts,
    activeCategory,
    nonEmptyCategories,
    allCategoryNames,
    handleCategorySelect
  } = useProductSection(
    productCategories,
    displayProducts,
    activeStoreIds,
    storeTags || [],
    searchQuery
  );
  
  // Display the ProductSectionLayout if we have supabase products
  if (supabaseProducts && supabaseProducts.length > 0) {
    return (
      <div className="container mx-auto px-4">
        <ProductSectionLayout
          storeTags={storeTags || []}
          onRemoveTag={onRemoveTag || (() => {})}
          categories={nonEmptyCategories}
          activeCategory={activeCategory}
          onCategorySelect={handleCategorySelect}
          products={filteredProducts}
          allCategoryNames={allCategoryNames}
          onQuantityChange={onProductQuantityChange || (() => {})}
          viewMode={viewMode}
        />
      </div>
    );
  }
  
  // Legacy display for non-supabase products
  // Filter products by selected store if needed
  const filteredLegacyProducts = selectedStore === 'all' 
    ? products 
    : products.filter(p => p.store === selectedStore);
  
  // Group products by category for better organization
  const groupedProducts: Record<string, Product[]> = {};
  
  filteredLegacyProducts.forEach(product => {
    const category = product.category || 'Other';
    if (!groupedProducts[category]) {
      groupedProducts[category] = [];
    }
    groupedProducts[category].push(product);
  });
  
  // Get legacy categories
  const legacyCategories = Object.keys(groupedProducts).sort();
  
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
      
      {legacyCategories.length === 0 ? (
        <p className="text-gray-500">No products found</p>
      ) : (
        <div className="space-y-8">
          {legacyCategories.map(category => (
            <div key={category} className="space-y-4">
              <h3 className="text-xl font-semibold">{category}</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {groupedProducts[category].map(product => (
                  <Card key={product.id} className="hover:shadow-lg transition-shadow">
                    <CardContent className="p-4">
                      <div className="font-medium">{product.name}</div>
                      <div className="text-lg font-bold">{product.currentPrice}</div>
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
