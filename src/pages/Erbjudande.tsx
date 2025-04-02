
import { useEffect, useState } from 'react';
import { Product } from '../types/product';
import { getProducts, getProductsByStore, getProductsByCategory } from '../services/productService';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { BottomNav } from '@/components/BottomNav';
import { useNavigationState } from '@/hooks/useNavigationState';

export default function Erbjudande() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'store' | 'category'>('all');
  const [selectedStore, setSelectedStore] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');

  const { 
    navItems, 
    setNavItems, 
    handleProductQuantityChange 
  } = useNavigationState();

  const handleNavSelect = (id: string) => {
    // Update active nav item
    const updatedNavItems = navItems.map(item => 
      item.id === id 
        ? { ...item, active: true } 
        : { ...item, active: false }
    );
    setNavItems(updatedNavItems);
  };

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

        setProducts(data);
        setError(null);
      } catch (err) {
        setError('Failed to fetch products');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [filter, selectedStore, selectedCategory]);

  const uniqueStores = [...new Set(products.map(p => p.store))];
  const uniqueCategories = [...new Set(products.map(p => p.category))];

  if (loading) {
    return <div className="container mx-auto p-4">Loading...</div>;
  }

  if (error) {
    return <div className="container mx-auto p-4 text-red-500">{error}</div>;
  }

  return (
    <div className="container mx-auto p-4 pb-20">
      <h1 className="text-3xl font-bold mb-6">Erbjudanden</h1>

      <div className="flex gap-4 mb-6">
        <Select
          value={filter}
          onValueChange={(value) => setFilter(value as 'all' | 'store' | 'category')}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Products</SelectItem>
            <SelectItem value="store">By Store</SelectItem>
            <SelectItem value="category">By Category</SelectItem>
          </SelectContent>
        </Select>

        {filter === 'store' && (
          <Select
            value={selectedStore}
            onValueChange={setSelectedStore}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select store" />
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
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              {uniqueCategories.map(category => (
                <SelectItem key={category} value={category}>{category}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {products.map((product) => (
          <Card key={product.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="text-xl">{product.name}</CardTitle>
              <div className="flex gap-2 mt-2">
                <Badge variant="outline">{product.brand || ''}</Badge>
                {product.is_kortvara && <Badge variant="destructive">Kortvara</Badge>}
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="text-2xl font-bold">{product.price}</p>
                <p className="text-sm text-gray-500">{product.unit || ''}</p>
                <p className="text-sm">{product.category || ''}</p>
                <p className="text-sm font-medium">{product.store || ''}</p>
                {product.additional_info && (
                  <p className="text-sm text-gray-600 mt-2">{product.additional_info}</p>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      
      <BottomNav 
        items={navItems} 
        onSelect={handleNavSelect} 
      />
    </div>
  );
}
