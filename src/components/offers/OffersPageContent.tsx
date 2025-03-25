
import React, { useEffect } from "react";
import { SearchBar } from "@/components/SearchBar";
import { BottomNav } from "@/components/BottomNav";
import { ProductSection } from "@/components/ProductSection";
import { PageHeader } from "@/components/PageHeader";
import { LoadingIndicator } from "@/components/LoadingIndicator";
import { NavItem } from "@/components/BottomNav";

interface OffersPageContentProps {
  title: string;
  isRefreshing: boolean;
  loading: boolean;
  viewMode: "grid" | "list";
  searchQuery: string;
  activeStores: string[];
  navItems: NavItem[];
  storeTags: { id: string; name: string }[];
  supabaseProducts: any[];
  handleRefresh: () => void;
  toggleViewMode: () => void;
  handleSearch: (query: string) => void;
  handleNavSelect: (id: string) => void;
  handleStoreToggle: (storeId: string) => void;
  handleRemoveTag: (id: string) => void;
  handleProductQuantityChange: (
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
}

export const OffersPageContent: React.FC<OffersPageContentProps> = ({
  title,
  isRefreshing,
  loading,
  viewMode,
  searchQuery,
  activeStores,
  navItems,
  storeTags,
  supabaseProducts,
  handleRefresh,
  toggleViewMode,
  handleSearch,
  handleNavSelect,
  handleStoreToggle,
  handleRemoveTag,
  handleProductQuantityChange
}) => {
  const filteredStoreTags = storeTags.filter(store => activeStores.includes(store.id));
  const showRetryButton = !isRefreshing && (loading || supabaseProducts.length === 0);
  
  console.log("OffersPageContent rendering with loading:", loading, "products:", supabaseProducts.length);
  console.log("Active stores:", activeStores);
  console.log("Filtered store tags:", filteredStoreTags);
  
  // Log whenever the products array changes
  useEffect(() => {
    console.log("Loaded", supabaseProducts.length, "products from Supabase");
    if (supabaseProducts.length > 0) {
      const storeCount = supabaseProducts.reduce((acc: Record<string, number>, product: any) => {
        const store = product.store?.toLowerCase() || 'unknown';
        acc[store] = (acc[store] || 0) + 1;
        return acc;
      }, {});
      console.log("Products by store:", storeCount);
    }
  }, [supabaseProducts]);

  // If we've been in a loading state for more than 10 seconds with no products,
  // trigger a refresh automatically
  useEffect(() => {
    let autoRefreshTimer: number | null = null;
    
    if (loading && supabaseProducts.length === 0 && !isRefreshing) {
      autoRefreshTimer = window.setTimeout(() => {
        console.log("Auto-triggering refresh after extended loading period");
        handleRefresh();
      }, 10000);
    }
    
    return () => {
      if (autoRefreshTimer) clearTimeout(autoRefreshTimer);
    };
  }, [loading, supabaseProducts.length, isRefreshing, handleRefresh]);

  return (
    <>
      <link
        rel="stylesheet"
        href="https://cdn.jsdelivr.net/npm/@tabler/icons-webfont@latest/dist/tabler-icons.min.css"
      />
      <div className="min-h-screen w-full bg-white pb-20">
        <div className="sticky top-0 z-30 bg-white shadow-sm">
          <PageHeader 
            title={title}
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
        
        {loading ? (
          <LoadingIndicator 
            retry={showRetryButton ? handleRefresh : undefined} 
            message={showRetryButton 
              ? "Laddar produkter från Supabase... Klicka på knappen nedan om det tar för lång tid." 
              : "Laddar produkter från Supabase..."}
          />
        ) : supabaseProducts.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-gray-500 mb-4">Inga produkter hittades</p>
            <button 
              onClick={handleRefresh}
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
            >
              Uppdatera produkter
            </button>
          </div>
        ) : (
          <ProductSection
            categories={categoriesData}
            storeTags={filteredStoreTags}
            activeStoreIds={activeStores}
            onProductQuantityChange={handleProductQuantityChange}
            onRemoveTag={handleRemoveTag}
            viewMode={viewMode}
            searchQuery={searchQuery}
            supabaseProducts={supabaseProducts}
          />
        )}
        <BottomNav items={navItems} onSelect={handleNavSelect} />
      </div>
    </>
  );
};

// Import these from productData to avoid circular dependencies
import { categoriesData } from "@/data/productData";
