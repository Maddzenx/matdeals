
import { useEffect, useState } from 'react';
import { useSupabaseProducts } from '../hooks/useSupabaseProducts';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { toast } from 'sonner';
import EnvTest from '../components/EnvTest';

export default function Index() {
  const { products, loading, error, refetch } = useSupabaseProducts();
  
  useEffect(() => {
    // Log products when they change for debugging
    console.log("Index page products:", products.length);
    if (products.length > 0) {
      console.log("Sample product:", products[0]);
    }
  }, [products]);

  return (
    <>
      <EnvTest />
      <div className="container mx-auto p-4">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Erbjudanden</h1>
          <button
            onClick={() => refetch()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Uppdatera produkter
          </button>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center min-h-[50vh]">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
            <p className="mt-4 text-lg">Hämtar erbjudanden...</p>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <h2 className="text-red-800 font-semibold">Ett fel uppstod</h2>
            <p className="text-red-600 mt-2">{error instanceof Error ? error.message : 'Unknown error'}</p>
            <pre className="text-xs mt-2 bg-red-100 p-2 rounded overflow-auto max-h-40">
              {JSON.stringify(error, null, 2)}
            </pre>
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-12">
            <h2 className="text-xl font-semibold mb-2">Inga produkter hittades</h2>
            <p className="text-gray-600 mb-4">
              Klicka på "Uppdatera produkter" för att ladda erbjudanden
            </p>
            <button
              onClick={() => refetch()}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Uppdatera produkter
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {products.map((product) => (
              <Card key={product.id} className="hover:shadow-lg transition-shadow">
                <div className="h-40 bg-gray-100 relative overflow-hidden">
                  <img 
                    src={product.image} 
                    alt={product.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.src = 'https://cdn.pixabay.com/photo/2020/10/05/19/55/grocery-5630804_1280.jpg';
                    }}
                  />
                  {product.offerBadge && (
                    <Badge className="absolute top-2 right-2 bg-red-500" variant="secondary">
                      {product.offerBadge}
                    </Badge>
                  )}
                </div>
                <CardHeader>
                  <CardTitle className="text-xl line-clamp-2">{product.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <p className="text-2xl font-bold">{product.currentPrice}</p>
                    {product.originalPrice && (
                      <p className="text-sm text-gray-500 line-through">{product.originalPrice}</p>
                    )}
                    <p className="text-sm">{product.details}</p>
                    <div className="flex gap-2 mt-2">
                      <Badge variant="outline">{product.category}</Badge>
                      <Badge variant="outline">{product.store}</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
