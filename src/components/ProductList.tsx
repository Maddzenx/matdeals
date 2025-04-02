import React from 'react';
import { useSupabaseProducts } from '@/hooks/useSupabaseProducts';

// Simple product card component
const ProductCard = ({ product }) => {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="relative h-48 bg-gray-200">
        {product.image ? (
          <img 
            src={product.image} 
            alt={product.name} 
            className="w-full h-full object-cover"
            onError={(e) => {
              e.currentTarget.src = 'https://cdn.pixabay.com/photo/2020/10/05/19/55/grocery-5630804_1280.jpg';
            }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-200">
            <span className="text-gray-400">No image</span>
          </div>
        )}
        {product.offerBadge && (
          <div className="absolute top-2 right-2 bg-red-600 text-white px-2 py-1 rounded-md text-xs font-bold">
            {product.offerBadge}
          </div>
        )}
      </div>
      <div className="p-4">
        <h3 className="font-bold text-lg mb-1 truncate">{product.name}</h3>
        <p className="text-sm text-gray-600 mb-2 line-clamp-2">{product.details}</p>
        <div className="flex justify-between items-center">
          <div>
            <span className="text-xl font-bold text-red-600">{product.currentPrice}</span>
            {product.originalPrice && (
              <span className="text-sm text-gray-500 line-through ml-2">{product.originalPrice}</span>
            )}
          </div>
          <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
            {product.store}
          </span>
        </div>
        {product.category && (
          <div className="mt-2">
            <span className="text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded-full">
              {product.category}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

// Main ProductList component
export const ProductList = () => {
  const { products, loading, error, refetch } = useSupabaseProducts();

  // Handle loading state
  if (loading) {
    return (
      <div className="container mx-auto p-4">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  // Handle error state
  if (error) {
    return (
      <div className="container mx-auto p-4">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <p className="font-bold">Error loading products</p>
          <p>{error.message}</p>
          <button 
            onClick={() => refetch()} 
            className="mt-2 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // Handle empty state
  if (!products || products.length === 0) {
    return (
      <div className="container mx-auto p-4">
        <div className="text-center p-8 bg-gray-100 rounded-lg">
          <h2 className="text-2xl font-bold text-gray-700 mb-2">No Products Found</h2>
          <p className="text-gray-600 mb-4">There are no products available at the moment.</p>
          <button 
            onClick={() => refetch()} 
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Refresh
          </button>
        </div>
      </div>
    );
  }

  // Render products grid
  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Products ({products.length})</h1>
        <button 
          onClick={() => refetch()} 
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 flex items-center"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
          </svg>
          Refresh
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
};

export default ProductList; 