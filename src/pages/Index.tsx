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
  const { activeStores, handleRemoveTag, handleStoreToggle, addStoreIfNeeded } = useStoreFilters(['ica']); // Start with ICA as default store
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

  // Ensure ICA is added as a store and selected by default
  useEffect(() => {
    // Always make sure ICA is available as a store
    addStoreIfNeeded('ica', 'ICA', storeTagsData);
    
    // Make sure ICA store is selected by default
    if (!activeStores.includes('ica')) {
      handleStoreToggle('ica');
    }
    
    console.log("Active stores after ICA initialization:", activeStores);
  }, []);
  
  // Additional effect to make sure Willys is added when products are available
  useEffect(() => {
    if (supabaseProducts && supabaseProducts.length > 0) {
      addStoreIfNeeded('willys', 'Willys', storeTagsData);
      console.log("Stores after adding ICA and Willys:", storeTagsData);
    }
  }, [supabaseProducts, addStoreIfNeeded]);

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
      console.log("Starting refresh of both ICA and Willys data");
      
      await Promise.all([
        handleScrapeIca().catch(err => {
          console.error("Error scraping ICA:", err);
          toast({
            title: "Fel vid uppdatering av ICA",
            description: "Kunde inte uppdatera ICA-erbjudanden. Willys-erbjudanden uppdateras ändå.",
            variant: "destructive"
          });
        }),
        handleScrapeWillys().catch(err => {
          console.error("Error scraping Willys:", err);
          toast({
            title: "Fel vid uppdatering av Willys",
            description: "Kunde inte uppdatera Willys-erbjudanden. ICA-erbjudanden uppdateras ändå.",
            variant: "destructive"
          });
        })
      ]);
      
      await refetch();
      
      toast({
        title: "Erbjudanden uppdaterade",
        description: "Produktdata har uppdaterats från både ICA och Willys.",
      });
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
  
  useEffect(() => {
    if (supabaseProducts && supabaseProducts.length > 0) {
      console.log("Loaded products from Supabase:", supabaseProducts.length, supabaseProducts.slice(0, 3));
      
      const storeCount = supabaseProducts.reduce((acc, product) => {
        const store = product.store?.toLowerCase() || 'unknown';
        acc[store] = (acc[store] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
      
      console.log("Products by store:", storeCount);
    } else {
      console.log("No products loaded from Supabase");
    }
  }, [supabaseProducts]);

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
