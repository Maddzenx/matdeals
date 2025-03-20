
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
          <LoadingIndicator />
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
