
import React, { useState } from "react";
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

const Index = () => {
  const navigate = useNavigate();
  const { handleProductQuantityChange } = useNavigationState();
  const { viewMode, toggleViewMode } = useViewMode("grid");
  const { activeStores, handleRemoveTag, handleStoreToggle, addStoreIfNeeded } = useStoreFilters(['ica', 'willys']);
  const [searchQuery, setSearchQuery] = useState("");
  const { products: supabaseProducts, loading, error, refetch } = useSupabaseProducts();
  const { isRefreshing, handleRefresh } = useProductRefresh(refetch);
  
  useAuthCheck();
  useInitialStoreSetup(activeStores, addStoreIfNeeded, handleStoreToggle, supabaseProducts);

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
      handleRefresh={handleRefresh} // Pass the actual refresh function instead of empty function
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
