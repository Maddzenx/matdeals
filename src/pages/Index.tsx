
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

  // Auto refresh handling is now controlled by the useProductRefresh hook
  // using the useAppSession to track first load, so we don't need to trigger it here

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

  // Handler for refresh button (if needed in the future)
  const handleRefreshButton = () => {
    handleRefresh(true); // Pass true to show notifications if we decide to re-add this button
  };

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
      handleRefresh={handleRefreshButton}
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
