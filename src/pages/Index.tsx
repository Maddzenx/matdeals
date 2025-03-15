
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
import { useScrapeWillys } from "@/hooks/useScrapeWillys";

const Index = () => {
  const navigate = useNavigate();
  const { 
    navItems, 
    handleProductQuantityChange,
  } = useNavigationState();
  
  const { viewMode, toggleViewMode } = useViewMode("grid");
  const { activeStores, handleRemoveTag, handleStoreToggle, addStoreIfNeeded } = useStoreFilters(storeTagsData.map(store => store.id));
  const [searchQuery, setSearchQuery] = useState("");
  const { products: supabaseProducts, loading, error, refetch } = useSupabaseProducts();
  const { scraping: scrapingIca, handleScrapeIca } = useScrapeIca(refetch);
  const { scraping: scrapingWillys, handleScrapeWillys } = useScrapeWillys(refetch);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  useAuthCheck();

  useEffect(() => {
    if (error) {
      toast({
        title: "Fel vid laddning av produkter",
        description: "Kunde inte ladda produkter från Supabase. Använder förvald produktdata istället.",
        variant: "destructive"
      });
      console.error("Supabase error:", error);
    }
  }, [error]);

  useEffect(() => {
    // Add ICA and Willys store tags if needed
    if (supabaseProducts && supabaseProducts.length > 0) {
      const stores = supabaseProducts.map(product => product.store);
      
      if (stores.includes('ICA')) {
        addStoreIfNeeded('ica', 'ICA', storeTagsData);
      }
      
      if (stores.includes('Willys')) {
        addStoreIfNeeded('willys', 'Willys', storeTagsData);
      }
    }
  }, [supabaseProducts, addStoreIfNeeded]);

  // Always include ICA and Willys in activeStores initially
  useEffect(() => {
    const defaultStores = ['ica', 'willys'];
    defaultStores.forEach(storeId => {
      if (!activeStores.includes(storeId)) {
        handleStoreToggle(storeId);
      }
    });
  }, []);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const handleNavSelect = (id: string) => {
    if (id === "cart") {
      navigate("/shopping-list");
    } else if (id === "profile") {
      navigate("/auth");
    } else if (id === "recipes") {
      navigate("/recipes");
    } else {
      console.log("Selected nav:", id);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    
    try {
      // Scrape both ICA and Willys
      await Promise.all([
        handleScrapeIca(),
        handleScrapeWillys()
      ]);
    } catch (error) {
      console.error("Error during refresh:", error);
      toast({
        title: "Refresheringsfel",
        description: "Ett fel inträffade vid uppdatering av erbjudanden.",
        variant: "destructive"
      });
    } finally {
      setIsRefreshing(false);
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
            onRefresh={handleRefresh}
            isRefreshing={isRefreshing || scrapingIca || scrapingWillys}
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
