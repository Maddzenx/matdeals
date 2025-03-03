
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { SearchBar } from "@/components/SearchBar";
import { BottomNav } from "@/components/BottomNav";
import { ProductSection } from "@/components/ProductSection";
import { useNavigationState } from "@/hooks/useNavigationState";
import { categoriesData, storeTagsData } from "@/data/productData";
import { Grid2X2, List } from "lucide-react";

const Index = () => {
  const navigate = useNavigate();
  const { navItems, handleProductQuantityChange } = useNavigationState();
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const handleRemoveTag = (id: string) => {
    console.log("Remove tag:", id);
  };

  const handleNavSelect = (id: string) => {
    if (id === "cart") {
      navigate("/shopping-list");
    } else {
      console.log("Selected nav:", id);
    }
  };

  const toggleViewMode = () => {
    setViewMode(prev => prev === "grid" ? "list" : "grid");
  };

  return (
    <>
      <link
        rel="stylesheet"
        href="https://cdn.jsdelivr.net/npm/@tabler/icons-webfont@latest/dist/tabler-icons.min.css"
      />
      <div className="min-h-screen w-full bg-white pb-20">
        <div className="sticky top-0 z-10 bg-white pt-2 pb-1">
          <div className="flex items-center justify-between px-4 mb-2">
            <h1 className="text-2xl font-bold text-[#1C1C1C]">Erbjudanden</h1>
            <button 
              onClick={toggleViewMode}
              className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
              aria-label={viewMode === "grid" ? "Switch to list view" : "Switch to grid view"}
            >
              {viewMode === "grid" ? <List size={20} /> : <Grid2X2 size={20} />}
            </button>
          </div>
          <SearchBar />
        </div>
        
        <ProductSection
          categories={categoriesData}
          storeTags={storeTagsData}
          onProductQuantityChange={handleProductQuantityChange}
          onRemoveTag={handleRemoveTag}
          viewMode={viewMode}
        />
        <BottomNav items={navItems} onSelect={handleNavSelect} />
      </div>
    </>
  );
};

export default Index;
