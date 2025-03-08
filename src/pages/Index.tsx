
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { SearchBar } from "@/components/SearchBar";
import { BottomNav } from "@/components/BottomNav";
import { ProductSection } from "@/components/ProductSection";
import { useNavigationState } from "@/hooks/useNavigationState";
import { categoriesData, storeTagsData } from "@/data/productData";
import { Grid2X2, List, RefreshCw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useSupabaseProducts } from "@/hooks/useSupabaseProducts";
import { toast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";

const Index = () => {
  const navigate = useNavigate();
  const { 
    navItems, 
    handleProductQuantityChange,
    cartItems
  } = useNavigationState();
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [activeStores, setActiveStores] = useState<string[]>(storeTagsData.map(store => store.id));
  const [searchQuery, setSearchQuery] = useState("");
  const { products: supabaseProducts, loading, error, refetch } = useSupabaseProducts();
  const [scraping, setScraping] = useState(false);

  useEffect(() => {
    // Check if the user is logged in when the component mounts
    const checkUser = async () => {
      const { data } = await supabase.auth.getUser();
      console.log("Current user:", data.user);
    };
    
    checkUser();
  }, []);

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

  const handleScrapeIca = async () => {
    try {
      setScraping(true);
      
      toast({
        title: "Fetching ICA products",
        description: "Please wait while we fetch the latest offers...",
      });
      
      // Call the Supabase edge function
      const { data, error } = await supabase.functions.invoke('scrape-ica');
      
      if (error) {
        throw error;
      }
      
      console.log("Scraping result:", data);
      
      // Refresh the products after scraping
      await refetch();
      
      toast({
        title: "Success!",
        description: `Updated ${data.products?.length || 0} products from ICA.`,
      });
    } catch (err) {
      console.error("Error scraping ICA:", err);
      toast({
        title: "Error",
        description: "Failed to fetch ICA products. Please try again later.",
        variant: "destructive"
      });
    } finally {
      setScraping(false);
    }
  };

  const handleRemoveTag = (id: string) => {
    setActiveStores(prev => prev.filter(storeId => storeId !== id));
  };

  const handleStoreToggle = (storeId: string) => {
    setActiveStores(prev => {
      if (prev.includes(storeId)) {
        return prev.filter(id => id !== storeId);
      } else {
        return [...prev, storeId];
      }
    });
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

  const toggleViewMode = () => {
    setViewMode(prev => prev === "grid" ? "list" : "grid");
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const filteredStoreTags = storeTagsData.filter(store => activeStores.includes(store.id));

  // Add supabase store tag if we have Supabase products
  useEffect(() => {
    if (supabaseProducts && supabaseProducts.length > 0) {
      // Check if ICA store tag already exists
      const icaTagExists = storeTagsData.some(store => store.id === 'ica');
      if (!icaTagExists) {
        // Add ICA store tag to active stores if it doesn't exist
        setActiveStores(prev => [...prev, 'ica']);
      }
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
          <div className="flex items-center justify-between px-4 pt-3 pb-1">
            <h1 className="text-2xl font-bold text-[#1C1C1C]">Erbjudanden</h1>
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleScrapeIca} 
                disabled={scraping}
                className="flex items-center gap-1"
              >
                <RefreshCw size={16} className={scraping ? "animate-spin" : ""} />
                <span className="hidden sm:inline">Uppdatera ICA</span>
              </Button>
              <button 
                onClick={toggleViewMode}
                className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
                aria-label={viewMode === "grid" ? "Switch to list view" : "Switch to grid view"}
              >
                {viewMode === "grid" ? <List size={20} /> : <Grid2X2 size={20} />}
              </button>
            </div>
          </div>
          <SearchBar 
            activeStoreIds={activeStores}
            onStoreToggle={handleStoreToggle}
            onSearch={handleSearch}
          />
        </div>
        
        {loading ? (
          <div className="p-4 flex justify-center">
            <p className="text-gray-500">Loading products from Supabase...</p>
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

export default Index;
