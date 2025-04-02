
import { useState } from 'react';
import { BottomNav } from '@/components/BottomNav';
import { useNavigationState } from '@/hooks/useNavigationState';
import { SearchBar } from '@/components/SearchBar';
import { CategoryTabs } from '@/components/CategoryTabs';
import { StoreTags } from '@/components/StoreTags';
import { useStoreFilters } from '@/hooks/useStoreFilters';
import { useSupabaseProducts } from '@/hooks/useSupabaseProducts';
import { LoadingIndicator } from '@/components/LoadingIndicator';
import { Button } from '@/components/ui/button';
import { useViewMode } from '@/hooks/useViewMode';
import { PageHeader } from '@/components/PageHeader';
import { ProductListView } from '@/components/products/ProductListView';
import { useProductFilters } from '@/hooks/useProductFilters';

export default function Erbjudande() {
  const { navItems, setNavItems, handleProductQuantityChange } = useNavigationState();
  const { activeStores, handleStoreToggle, handleRemoveTag } = useStoreFilters([]);
  const { viewMode, toggleViewMode } = useViewMode();
  const { products, loading, error, refetch } = useSupabaseProducts();
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  // Use our custom hook for filtering
  const {
    searchQuery,
    setSearchQuery,
    activeCategory,
    setActiveCategory,
    applyAllFilters
  } = useProductFilters();

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

  // Apply all filters to the products
  const filteredProducts = applyAllFilters(products, activeStores);

  // Prepare store tags for display
  const storeTags = activeStores.map(storeId => {
    let displayName = storeId;
    if (storeId.toLowerCase() === 'willys') displayName = 'Willys';
    if (storeId.toLowerCase() === 'willys johanneberg') displayName = 'Willys Johanneberg';
    if (storeId.toLowerCase() === 'hemkop') displayName = 'Hemköp';
    if (storeId.toLowerCase() === 'ica') displayName = 'ICA';
    return { id: storeId, name: displayName };
  });

  // Get the active category name for display
  const activeCategoryName = activeCategory === 'all' 
    ? 'Alla erbjudanden' 
    : categories.find(c => c.id === activeCategory)?.name || 'Erbjudanden';

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
          onStoreToggle={handleStoreToggle}
          onSearch={handleSearch}
        />
      </div>

      <div className="px-4 pt-2">
        <StoreTags tags={storeTags} onRemove={handleRemoveTag} />
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
          <ProductListView
            products={filteredProducts}
            viewMode={viewMode}
            onQuantityChange={handleProductQuantityChange}
            categoryName={activeCategoryName}
          />
        )}
      </main>

      <BottomNav 
        items={navItems} 
        onSelect={handleNavSelect} 
      />
    </div>
  );
}
