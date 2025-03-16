
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
  const { activeStores, handleRemoveTag, handleStoreToggle, addStoreIfNeeded } = useStoreFilters(['ica', 'willys']);
  const [searchQuery, setSearchQuery] = useState("");
  const { products: supabaseProducts, loading, error, refetch } = useSupabaseProducts();
  const { scraping: scrapingIca, handleScrapeIca } = useScrapeIca(refetch);
  const { scraping: scrapingWillys, handleScrapeWillys } = useScrapeWillys(refetch);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  useAuthCheck();

  // Auto refresh products when the application loads
  useEffect(() => {
    const autoRefreshProducts = async () => {
      try {
        setIsRefreshing(true);
        console.log("Auto refreshing products on application load...");
        await handleRefresh();
      } catch (error) {
        console.error("Error during auto refresh:", error);
      } finally {
        setIsRefreshing(false);
      }
    };
    
    autoRefreshProducts();
  }, []);

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
    // Make sure both stores are available in the store filter by default
    addStoreIfNeeded('ica', 'ICA', storeTagsData);
    addStoreIfNeeded('willys', 'Willys', storeTagsData);
    
    // Make sure both stores are selected by default
    if (!activeStores.includes('ica')) {
      handleStoreToggle('ica');
    }
    if (!activeStores.includes('willys')) {
      handleStoreToggle('willys');
    }
  }, []);
  
  useEffect(() => {
    if (supabaseProducts && supabaseProducts.length > 0) {
      console.log(`Loaded ${supabaseProducts.length} products from Supabase`);
      
      // Count products by store
      const storeCount = supabaseProducts.reduce((acc, product) => {
        const store = product.store?.toLowerCase() || 'unknown';
        acc[store] = (acc[store] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
      
      console.log("Products by store:", storeCount);
      
      // Make sure store filters are available for all stores in the data
      Object.keys(storeCount).forEach(store => {
        if (store !== 'unknown') {
          const storeName = store === 'ica' ? 'ICA' : 
                           store === 'willys' ? 'Willys' : 
                           store.charAt(0).toUpperCase() + store.slice(1);
          addStoreIfNeeded(store, storeName, storeTagsData);
        }
      });
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
