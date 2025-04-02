import { useState } from 'react';
import { useUnifiedProducts, Product } from '@/hooks/useUnifiedProducts';

export function UnifiedProductList() {
  const { products, loading, error, refreshProducts } = useUnifiedProducts();
  const [storeFilter, setStoreFilter] = useState<string | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);
  
  // Get unique stores and categories for filters
  const stores = [...new Set(products.map((product: Product) => product.store))];
  const categories = [...new Set(products.map((product: Product) => product.category))];
  
  // Filter products
  const filteredProducts = products.filter((product: Product) => {
    if (storeFilter && product.store !== storeFilter) return false;
    if (categoryFilter && product.category !== categoryFilter) return false;
    return true;
  });
  
  if (loading) {
    return <div className="p-4 text-center">Laddar produkter...</div>;
  }
  
  if (error) {
    return (
      <div className="p-4 text-center">
        <p className="text-red-500">Ett fel uppstod: {error.message}</p>
        <button 
          className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          onClick={() => refreshProducts()}
        >
          Försök igen
        </button>
      </div>
    );
  }
  
  if (products.length === 0) {
    return (
      <div className="p-4 text-center">
        <p>Inga produkter hittades</p>
        <button 
          className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          onClick={() => refreshProducts()}
        >
          Uppdatera
        </button>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Aktuella erbjudanden</h2>
        <button 
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          onClick={() => refreshProducts()}
        >
          Uppdatera
        </button>
      </div>
      
      {/* Filters */}
      <div className="mb-6 flex flex-wrap gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Butik</label>
          <select 
            className="border rounded p-2"
            value={storeFilter || ''}
            onChange={(e) => setStoreFilter(e.target.value || null)}
          >
            <option value="">Alla butiker</option>
            {stores.map(store => (
              <option key={store} value={store}>{store.charAt(0).toUpperCase() + store.slice(1)}</option>
            ))}
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1">Kategori</label>
          <select 
            className="border rounded p-2"
            value={categoryFilter || ''}
            onChange={(e) => setCategoryFilter(e.target.value || null)}
          >
            <option value="">Alla kategorier</option>
            {categories.map(category => (
              <option key={category} value={category}>{category.charAt(0).toUpperCase() + category.slice(1)}</option>
            ))}
          </select>
        </div>
      </div>
      
      {filteredProducts.length === 0 ? (
        <p className="text-center py-4">Inga produkter matchar dina filter</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredProducts.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}

// Product card component
function ProductCard({ product }: { product: Product }) {
  const [imageError, setImageError] = useState(false);
  
  const handleImageError = () => {
    setImageError(true);
  };
  
  return (
    <div className="border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
      <div className="relative h-48 bg-gray-100">
        <img 
          src={imageError ? 'https://cdn.pixabay.com/photo/2020/10/05/19/55/grocery-5630804_1280.jpg' : product.image} 
          alt={product.name}
          className="w-full h-full object-cover"
          onError={handleImageError}
        />
        
        {product.offerBadge && (
          <div className="absolute top-2 right-2 bg-red-500 text-white text-xs px-2 py-1 rounded">
            {product.offerBadge}
          </div>
        )}
      </div>
      
      <div className="p-4">
        <h3 className="font-medium text-lg mb-1 line-clamp-2">{product.name}</h3>
        <p className="text-sm text-gray-600 mb-2 line-clamp-2">{product.details}</p>
        
        <div className="flex justify-between items-end">
          <div>
            <div className="text-lg font-bold">{product.currentPrice}</div>
            {product.originalPrice && (
              <div className="text-sm text-gray-500">{product.originalPrice}</div>
            )}
          </div>
          
          <div className="text-xs uppercase font-medium px-2 py-1 bg-gray-100 rounded">
            {product.category}
          </div>
        </div>
      </div>
    </div>
  );
} 