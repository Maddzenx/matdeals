
import { useState, useEffect } from 'react';
import { BottomNav } from '@/components/BottomNav';
import { useNavigationState } from '@/hooks/useNavigationState';
import { ProductGrid } from '@/components/ProductGrid';
import { SearchBar } from '@/components/SearchBar';
import { CategoryTabs } from '@/components/CategoryTabs';
import { StoreTags } from '@/components/StoreTags';
import { useStoreFilters } from '@/hooks/useStoreFilters';
import { useSupabaseProducts } from '@/hooks/useSupabaseProducts';
import { LoadingIndicator } from '@/components/LoadingIndicator';
import { Button } from '@/components/ui/button';
import { useViewMode } from '@/hooks/useViewMode';
import { PageHeader } from '@/components/PageHeader';

export default function Erbjudande() {
  const { navItems, setNavItems, handleProductQuantityChange } = useNavigationState();
  const { activeStores, toggleStore } = useStoreFilters();
  const [searchQuery, setSearchQuery] = useState('');
  const { viewMode, toggleViewMode } = useViewMode();
  const { products, loading, error, refetch } = useSupabaseProducts();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [activeCategory, setActiveCategory] = useState('all');

  const categories = [
    { id: "all", name: "Alla" },
    { id: "fruits", name: "Frukt & grönt" },
    { id: "bread", name: "Bröd & bageri" },
    { id: "meat", name: "Kött, fågel & chark" },
    { id: "dairy", name: "Mejeri" },
    { id: "beverages", name: "Dryck" }
  ];

  const handleNavSelect = (id: string) => {
    const updatedNavItems = navItems.map(item => 
      item.id === id 
        ? { ...item, active: true } 
        : { ...item, active: false }
    );
    setNavItems(updatedNavItems);
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refetch();
    } catch (err) {
      console.error('Error refreshing products:', err);
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const filterProductsByCategory = (products: any[]) => {
    if (activeCategory === 'all') return products;
    return products.filter(product => {
      if (activeCategory === 'fruits') return product.category?.toLowerCase().includes('frukt') || product.category?.toLowerCase().includes('grönt');
      if (activeCategory === 'bread') return product.category?.toLowerCase().includes('bröd') || product.category?.toLowerCase().includes('bageri');
      if (activeCategory === 'meat') return product.category?.toLowerCase().includes('kött') || product.category?.toLowerCase().includes('fågel') || product.category?.toLowerCase().includes('chark');
      if (activeCategory === 'dairy') return product.category?.toLowerCase().includes('mejeri');
      if (activeCategory === 'beverages') return product.category?.toLowerCase().includes('dryck');
      return false;
    });
  };

  const filterProductsBySearch = (products: any[]) => {
    if (!searchQuery.trim()) return products;
    const query = searchQuery.toLowerCase();
    return products.filter(product => 
      product.name?.toLowerCase().includes(query) || 
      product.brand?.toLowerCase().includes(query) ||
      product.additional_info?.toLowerCase().includes(query)
    );
  };

  const filterProductsByStore = (products: any[]) => {
    if (activeStores.length === 0) return products;
    return products.filter(product => 
      activeStores.some(storeId => 
        product.store?.toLowerCase() === storeId.toLowerCase()
      )
    );
  };

  const filteredProducts = filterProductsByStore(
    filterProductsByCategory(
      filterProductsBySearch(products)
    )
  );

  const storeTags = activeStores.map(storeId => {
    let displayName = storeId;
    if (storeId.toLowerCase() === 'willys') displayName = 'Willys';
    if (storeId.toLowerCase() === 'willys johanneberg') displayName = 'Willys Johanneberg';
    if (storeId.toLowerCase() === 'hemkop') displayName = 'Hemköp';
    if (storeId.toLowerCase() === 'ica') displayName = 'ICA';
    return { id: storeId, name: displayName };
  });

  const transformedProducts = filteredProducts.map(product => ({
    id: product.id,
    name: product.name,
    details: `${product.brand || ''}, ${product.unit || ''}`,
    image: product.image || 'https://assets.icanet.se/t_product_large_v1,f_auto/7310865085313.jpg',
    currentPrice: `${product.price?.toString().replace('.', ',')} kr/st`,
    originalPrice: product.original_price ? `${product.original_price?.toString().replace('.', ',')} kr/st` : '',
    store: product.store || 'Unknown',
    offerBadge: product.label ? product.label : product.is_kortvara ? 'Kortvara' : 'Erbjudande',
    additionalInfo: product.additional_info || '',
    unitPrice: `Jmf pris ${product.unit_price || ''}`
  }));

  return (
    <div className="min-h-screen bg-white pb-20">
      <div className="sticky top-0 z-30 bg-white shadow-sm">
        <PageHeader 
          title="Erbjudanden"
          onRefresh={handleRefresh}
          isRefreshing={isRefreshing}
          viewMode={viewMode}
          onToggleViewMode={toggleViewMode}
        />
        <SearchBar 
          activeStoreIds={activeStores}
          onStoreToggle={toggleStore}
          onSearch={handleSearch}
        />
      </div>

      <div className="px-4 pt-2">
        <StoreTags tags={storeTags} onRemove={toggleStore} />
      </div>
      
      <CategoryTabs
        categories={categories}
        activeCategory={activeCategory}
        onSelect={setActiveCategory}
      />
      
      <main className="p-4">
        {loading ? (
          <LoadingIndicator 
            retry={handleRefresh} 
            message={isRefreshing 
              ? "Hämtar produkter från butikerna... Detta kan ta några minuter." 
              : "Laddar produkter..."} 
          />
        ) : filteredProducts.length === 0 ? (
          <div className="p-8 text-center flex flex-col items-center">
            <p className="text-gray-500 mb-4">Inga produkter hittades</p>
            <Button 
              onClick={handleRefresh}
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
              disabled={isRefreshing}
            >
              {isRefreshing ? "Uppdaterar..." : "Uppdatera produkter"}
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-[#1C1C1C] mb-4">
              {activeCategory === 'all' ? 'Alla erbjudanden' : categories.find(c => c.id === activeCategory)?.name || 'Erbjudanden'}
            </h2>
            <div className="grid grid-cols-2 gap-4">
              {transformedProducts.map(product => (
                <OfferProductCard 
                  key={product.id}
                  product={product}
                  onQuantityChange={(newQuantity, previousQuantity) => 
                    handleProductQuantityChange(
                      product.id, 
                      newQuantity, 
                      previousQuantity,
                      {
                        name: product.name,
                        details: product.details,
                        price: product.currentPrice,
                        image: product.image,
                        store: product.store
                      }
                    )
                  }
                />
              ))}
            </div>
          </div>
        )}
      </main>

      <BottomNav 
        items={navItems} 
        onSelect={handleNavSelect} 
      />
    </div>
  );
}

interface ProductCardProps {
  product: {
    id: string;
    name: string;
    details: string;
    image: string;
    currentPrice: string;
    originalPrice: string;
    store: string;
    offerBadge?: string;
    additionalInfo?: string;
    unitPrice?: string;
  };
  onQuantityChange: (newQuantity: number, previousQuantity: number) => void;
}

function OfferProductCard({ product, onQuantityChange }: ProductCardProps) {
  const [quantity, setQuantity] = useState(0);

  const handleIncrement = () => {
    const prevQuantity = quantity;
    const newQuantity = prevQuantity + 1;
    setQuantity(newQuantity);
    onQuantityChange(newQuantity, prevQuantity);
  };

  const handleDecrement = () => {
    if (quantity > 0) {
      const prevQuantity = quantity;
      const newQuantity = prevQuantity - 1;
      setQuantity(newQuantity);
      onQuantityChange(newQuantity, prevQuantity);
    }
  };

  const handleAddToList = () => {
    if (quantity === 0) {
      const newQuantity = 1;
      setQuantity(newQuantity);
      onQuantityChange(newQuantity, 0);
    }
  };

  return (
    <div className="bg-white border border-gray-100 rounded-lg overflow-hidden shadow-sm">
      <div className="relative h-36 bg-gray-50">
        <img 
          src={product.image} 
          alt={product.name}
          className="w-full h-full object-contain"
          onError={(e) => {
            e.currentTarget.src = 'https://assets.icanet.se/t_product_large_v1,f_auto/7310865085313.jpg';
          }}
        />
        {product.offerBadge && (
          <div className="absolute top-2 right-2 bg-yellow-400 text-[#DB2C17] font-bold text-xs px-2 py-1 rounded-full">
            {product.offerBadge}
          </div>
        )}
      </div>
      <div className="p-3">
        <h3 className="font-bold text-[#1C1C1C] text-sm mb-0.5 line-clamp-1">{product.name}</h3>
        <p className="text-xs text-gray-600 mb-1.5 line-clamp-1">{product.details}</p>
        {product.unitPrice && (
          <p className="text-xs text-gray-500 mb-1">{product.unitPrice}</p>
        )}
        <div className="flex items-baseline gap-2 mb-1">
          <span className="text-lg font-extrabold text-[#1C1C1C]">
            {product.currentPrice.split(' ')[0]}
            <span className="text-sm font-bold"> kr/st</span>
          </span>
          {product.originalPrice && (
            <span className="text-xs text-gray-500 line-through">
              {product.originalPrice}
            </span>
          )}
        </div>
        <div className="text-xs font-medium text-gray-700 mb-2.5 py-0.5 px-1 bg-gray-100 rounded text-center">
          {product.store}
        </div>
        
        {quantity === 0 ? (
          <button
            onClick={handleAddToList}
            className="w-full bg-[#DB2C17] text-white rounded-md py-2.5 text-sm font-medium"
          >
            Lägg till
          </button>
        ) : (
          <div className="flex items-center justify-between bg-gray-100 rounded-md">
            <button
              onClick={handleDecrement}
              className="h-10 w-10 flex items-center justify-center text-[#DB2C17] font-bold text-xl"
            >
              -
            </button>
            <span className="text-sm font-medium">{quantity} st</span>
            <button
              onClick={handleIncrement}
              className="h-10 w-10 flex items-center justify-center text-white bg-[#DB2C17] rounded-r-md font-bold text-xl"
            >
              +
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
