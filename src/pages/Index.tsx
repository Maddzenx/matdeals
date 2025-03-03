
import React from "react";
import { useNavigate } from "react-router-dom";
import { SearchBar } from "@/components/SearchBar";
import { BottomNav } from "@/components/BottomNav";
import { ProductSection } from "@/components/ProductSection";
import { useNavigationState } from "@/hooks/useNavigationState";
import { categoriesData, storeTagsData } from "@/data/productData";

const Index = () => {
  const navigate = useNavigate();
  const { navItems, handleProductQuantityChange } = useNavigationState();

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

  return (
    <>
      <link
        rel="stylesheet"
        href="https://cdn.jsdelivr.net/npm/@tabler/icons-webfont@latest/dist/tabler-icons.min.css"
      />
      <div className="min-h-screen w-full bg-white pb-20">
        <SearchBar />
        <ProductSection
          categories={categoriesData}
          storeTags={storeTagsData}
          onProductQuantityChange={handleProductQuantityChange}
          onRemoveTag={handleRemoveTag}
        />
        <BottomNav items={navItems} onSelect={handleNavSelect} />
      </div>
    </>
  );
};

export default Index;
