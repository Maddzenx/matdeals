
import React from "react";
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
  const showRetryButton = !isRefreshing && loading && supabaseProducts.length === 0;
  
  console.log("OffersPageContent rendering with loading:", loading, "products:", supabaseProducts.length);

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
              ? "Kunde inte ladda produkter. Klicka på knappen nedan för att försöka igen." 
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
