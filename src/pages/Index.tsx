
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { SearchBar } from "@/components/SearchBar";
import { BottomNav } from "@/components/BottomNav";
import { ProductSection } from "@/components/ProductSection";
import { useNavigationState } from "@/hooks/useNavigationState";
import { categoriesData, storeTagsData } from "@/data/productData";
import { Grid2X2, List } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useSupabaseProducts } from "@/hooks/useSupabaseProducts";
import { toast } from "@/components/ui/use-toast";

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
  const { products: supabaseProducts, loading, error } = useSupabaseProducts();

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
            <button 
              onClick={toggleViewMode}
              className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
              aria-label={viewMode === "grid" ? "Switch to list view" : "Switch to grid view"}
            >
              {viewMode === "grid" ? <List size={20} /> : <Grid2X2 size={20} />}
            </button>
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
