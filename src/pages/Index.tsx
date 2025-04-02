import { useEffect, useState } from 'react';
import { Product } from '../types/product';
import { getProducts, getProductsByStore, getProductsByCategory } from '../services/productService';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { toast } from 'sonner';
import EnvTest from '../components/EnvTest';

export default function Index() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'store' | 'category'>('all');
  const [selectedStore, setSelectedStore] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        let data: Product[] = [];

        if (filter === 'store' && selectedStore) {
          data = await getProductsByStore(selectedStore);
        } else if (filter === 'category' && selectedCategory) {
          data = await getProductsByCategory(selectedCategory);
        } else {
          data = await getProducts();
        }

        console.log('Fetched products:', data);
        setProducts(data);
        setError(null);
        
        if (data.length === 0) {
          console.log('No products found');
          toast.info("Inga produkter hittades", {
            description: "Uppdatera produkter genom att klicka på uppdatera-knappen",
            duration: 5000
          });
        }
      } catch (err) {
        console.error('Error fetching products:', err);
        const errorMessage = err instanceof Error ? err.message : 'Failed to fetch products';
        setError(errorMessage);
        toast.error("Kunde inte hämta produkter", {
          description: "Försök igen senare eller kontakta support",
          duration: 5000
        });
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [filter, selectedStore, selectedCategory]);

  const uniqueStores = [...new Set(products.map(p => p.store))];
  const uniqueCategories = [...new Set(products.map(p => p.category))];

  console.log('Current products state:', products);
  console.log('Unique stores:', uniqueStores);
  console.log('Unique categories:', uniqueCategories);

  return (
    <>
      <EnvTest />
      <div className="container mx-auto p-4">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Erbjudanden</h1>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Uppdatera produkter
          </button>
        </div>

        <div className="flex gap-4 mb-6">
          <Select
            value={filter}
            onValueChange={(value) => setFilter(value as 'all' | 'store' | 'category')}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Alla produkter</SelectItem>
              <SelectItem value="store">Efter butik</SelectItem>
              <SelectItem value="category">Efter kategori</SelectItem>
            </SelectContent>
          </Select>

          {filter === 'store' && (
            <Select
              value={selectedStore}
              onValueChange={setSelectedStore}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Välj butik" />
              </SelectTrigger>
              <SelectContent>
                {uniqueStores.map(store => (
                  <SelectItem key={store} value={store}>{store}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          {filter === 'category' && (
            <Select
              value={selectedCategory}
              onValueChange={setSelectedCategory}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Välj kategori" />
              </SelectTrigger>
              <SelectContent>
                {uniqueCategories.map(category => (
                  <SelectItem key={category} value={category}>{category}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center min-h-[50vh]">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
            <p className="mt-4 text-lg">Hämtar erbjudanden...</p>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <h2 className="text-red-800 font-semibold">Ett fel uppstod</h2>
            <p className="text-red-600 mt-2">{error}</p>
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-12">
            <h2 className="text-xl font-semibold mb-2">Inga produkter hittades</h2>
            <p className="text-gray-600 mb-4">
              Det kan ta upp till 5 minuter att hämta erbjudanden från butikerna
            </p>
            <p className="text-gray-500">
              Om inga produkter visas efter flera försök, kontakta supportteamet
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {products.map((product) => (
              <Card key={product.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="text-xl">{product.name}</CardTitle>
                  <div className="flex gap-2 mt-2">
                    <Badge variant="outline">{product.brand}</Badge>
                    {product.is_kortvara && <Badge variant="destructive">Kortvara</Badge>}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <p className="text-2xl font-bold">{product.price}</p>
                    <p className="text-sm text-gray-500">{product.unit}</p>
                    <p className="text-sm">{product.category}</p>
                    <p className="text-sm font-medium">{product.store}</p>
                    {product.additional_info && (
                      <p className="text-sm text-gray-600 mt-2">{product.additional_info}</p>
                    )}
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