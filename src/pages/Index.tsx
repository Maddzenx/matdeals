
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useNavigationState } from "@/hooks/useNavigationState";
import { useViewMode } from "@/hooks/useViewMode";
import { useStoreFilters } from "@/hooks/useStoreFilters";
import { useSupabaseProducts } from "@/hooks/useSupabaseProducts";
import { useProductRefresh } from "@/hooks/useProductRefresh";
import { useInitialStoreSetup } from "@/hooks/useInitialStoreSetup";
import { useAuthCheck } from "@/hooks/useAuthCheck";
import { OffersPageContent } from "@/components/offers/OffersPageContent";
import { storeTagsData } from "@/data/productData";
import { toast } from "sonner";

const Index = () => {
  const navigate = useNavigate();
  const { handleProductQuantityChange } = useNavigationState();
  const { viewMode, toggleViewMode } = useViewMode("grid");
  const { activeStores, handleRemoveTag, handleStoreToggle, addStoreIfNeeded } = useStoreFilters(['ica', 'willys', 'hemkop']);
  const [searchQuery, setSearchQuery] = useState("");
  const { products: supabaseProducts, loading, error, refetch } = useSupabaseProducts();
  const { isRefreshing, handleRefresh } = useProductRefresh(refetch);
  
  useAuthCheck();
  useInitialStoreSetup(activeStores, addStoreIfNeeded, handleStoreToggle, supabaseProducts);

  // Force a refresh when the page loads
  useEffect(() => {
    console.log("Index page mounted, forcing immediate data refresh");
    
    const triggerInitialLoad = async () => {
      console.log("Triggering initial data refresh");
      toast.info("Uppdaterar butikserbjudanden...", {
        description: "Hämtar erbjudanden från butiker, detta kan ta några minuter",
        duration: 10000
      });
      
      try {
        // Force a full refresh from all store sources
        const result = await handleRefresh(true); // Set to true to show notifications
        
        if (result && result.success) {
          toast.success("Uppdatering färdig!", {
            description: `Butikserbjudanden har uppdaterats. ${supabaseProducts.length} produkter hittades.`
          });
          
          if (supabaseProducts.length === 0) {
            console.log("No products found after refresh, retrying scrape...");
            // If no products are found, try scraping again after a short delay
            setTimeout(async () => {
              await handleRefresh(true);
            }, 5000);
          }
        } else {
          console.error("Initial refresh failed:", result?.error);
          toast.error("Kunde inte hämta erbjudanden", {
            description: "Försök att klicka på uppdatera-knappen igen"
          });
        }
      } catch (err) {
        console.error("Error during initial refresh:", err);
        toast.error("Ett fel uppstod vid uppdatering", {
          description: "Kontrollera din internetanslutning och försök igen"
        });
      }
    };
    
    // Start loading immediately
    triggerInitialLoad();
  }, []);

  useEffect(() => {
    console.log("Active stores:", activeStores);
    if (supabaseProducts.length > 0) {
      const storeCount = supabaseProducts.reduce((acc, product) => {
        const store = product.store?.toLowerCase() || 'unknown';
        acc[store] = (acc[store] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
      console.log("Products by store:", storeCount);
    } else {
      console.log("No products loaded from Supabase yet");
    }
  }, [activeStores, supabaseProducts]);

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

  // Enhanced refresh handler that ensures data is scraped
  const handleForceRefresh = async () => {
    console.log("User clicked refresh button, forcing scrape from all sources");
    toast.info("Uppdaterar butikserbjudanden...", {
      description: "Hämtar färska erbjudanden från alla butiker",
      duration: 10000
    });
    
    try {
      const result = await handleRefresh(true);
      
      if (result && result.success) {
        console.log("Refresh successful");
        
        // If we still have no products, show a more detailed message
        if (supabaseProducts.length === 0) {
          toast.info("Inga erbjudanden hittades", {
            description: "Det kan bero på att butikernas webbsidor har ändrats. Vi arbetar på en lösning."
          });
        }
      } else {
        console.error("Force refresh failed:", result?.error);
      }
    } catch (error) {
      console.error("Error during force refresh:", error);
    }
  };

  // Get navigation items from navigation state
  const { navItems } = useNavigationState();

  return (
    <OffersPageContent
      title="Erbjudanden"
      isRefreshing={isRefreshing}
      loading={loading}
      viewMode={viewMode}
      searchQuery={searchQuery}
      activeStores={activeStores}
      navItems={navItems}
      storeTags={storeTagsData}
      supabaseProducts={supabaseProducts}
      handleRefresh={handleForceRefresh}
      toggleViewMode={toggleViewMode}
      handleSearch={handleSearch}
      handleNavSelect={handleNavSelect}
      handleStoreToggle={handleStoreToggle}
      handleRemoveTag={handleRemoveTag}
      handleProductQuantityChange={handleProductQuantityChange}
    />
  );
};

export default Index;
