
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { SearchBar } from "@/components/SearchBar";
import { BottomNav } from "@/components/BottomNav";
import { ProductSection } from "@/components/ProductSection";
import { useNavigationState } from "@/hooks/useNavigationState";
import { categoriesData, storeTagsData } from "@/data/productData";
import { useSupabaseProducts } from "@/hooks/useSupabaseProducts";
import { toast } from "@/components/ui/use-toast";
import { PageHeader } from "@/components/PageHeader";
import { LoadingIndicator } from "@/components/LoadingIndicator";
import { useAuthCheck } from "@/hooks/useAuthCheck";
import { useViewMode } from "@/hooks/useViewMode";
import { useStoreFilters } from "@/hooks/useStoreFilters";
import { useScrapeIca } from "@/hooks/useScrapeIca";

const Index = () => {
  const navigate = useNavigate();
  const { 
    navItems, 
    handleProductQuantityChange,
  } = useNavigationState();
  
  const { viewMode, toggleViewMode } = useViewMode("grid");
  const { activeStores, handleRemoveTag, handleStoreToggle, addIcaStoreIfNeeded } = useStoreFilters(storeTagsData.map(store => store.id));
  const [searchQuery, setSearchQuery] = useState("");
  const { products: supabaseProducts, loading, error, refetch } = useSupabaseProducts();
  const { scraping, handleScrapeIca } = useScrapeIca(refetch);
  
  // Check authentication status
  useAuthCheck();

  // Error handling for Supabase fetch
  useEffect(() => {
    // Show error toast if there's an error fetching from Supabase
    if (error) {
      toast({
        title: "Error loading products",
        description: "Could not load products from Supabase. Using default product data instead.",
        variant: "destructive"
      });
      console.error("Supabase error:", error);
    }
  }, [error]);

  // Add ICA store tag if we have Supabase products
  useEffect(() => {
    addIcaStoreIfNeeded(supabaseProducts, storeTagsData);
  }, [supabaseProducts]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const handleNavSelect = (id: string) => {
    if (id === "cart") {
      navigate("/shopping-list");
    } else if (id === "profile") {
      navigate("/auth");
    } else {
      console.log("Selected nav:", id);
    }
  };

  const filteredStoreTags = storeTagsData.filter(store => activeStores.includes(store.id));

  return (
    <>
      <link
        rel="stylesheet"
        href="https://cdn.jsdelivr.net/npm/@tabler/icons-webfont@latest/dist/tabler-icons.min.css"
      />
      <div className="min-h-screen w-full bg-white pb-20">
        <div className="sticky top-0 z-30 bg-white">
          <PageHeader 
            title="Erbjudanden"
            onRefresh={handleScrapeIca}
            isRefreshing={scraping}
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

export default Index;
