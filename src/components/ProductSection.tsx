
import React, { useState, useEffect, useRef } from "react";
import { ProductGrid } from "@/components/ProductGrid";
import { StoreTags } from "@/components/StoreTags";
import { CategoryTabs } from "@/components/CategoryTabs";
import { CategoryData, Product } from "@/data/productData";
import { useProductUtils } from "@/hooks/useProductUtils";

interface ProductSectionProps {
  categories: CategoryData[];
  storeTags: { id: string; name: string }[];
  activeStoreIds: string[];
  onProductQuantityChange: (
    productId: string, 
    newQuantity: number, 
    previousQuantity: number,
    productDetails?: {
      name: string;
      details: string;
      price: string;
      image?: string;
      store?: string;
    }
  ) => void;
  onRemoveTag: (id: string) => void;
  viewMode?: "grid" | "list";
  searchQuery?: string;
  supabaseProducts?: Product[];
}

export const ProductSection: React.FC<ProductSectionProps> = ({
  categories,
  storeTags,
  activeStoreIds,
  onProductQuantityChange,
  onRemoveTag,
  viewMode = "grid",
  searchQuery = "",
  supabaseProducts = []
}) => {
  const { 
    getProductsWithCategories, 
    scrollToCategory, 
    getAllCategoryNames,
    getNonEmptyCategories
  } = useProductUtils(categories);
  
  const nonEmptyCategories = getNonEmptyCategories();
  const [activeCategory, setActiveCategory] = useState(nonEmptyCategories.length > 0 ? nonEmptyCategories[0].id : "");
  const scrolledToCategoryRef = useRef(false);
  
  // Get products from data file
  const allLocalProducts = getProductsWithCategories();
  
  // Combine local products with Supabase products
  const allProducts = React.useMemo(() => {
    if (supabaseProducts.length === 0) {
      return allLocalProducts;
    }
    
    // Add Supabase products 
    return [...allLocalProducts, ...supabaseProducts];
  }, [allLocalProducts, supabaseProducts]);
  
  const allCategoryNames = getAllCategoryNames();

  // Set initial active category when non-empty categories change
  useEffect(() => {
    if (nonEmptyCategories.length > 0 && !nonEmptyCategories.some(c => c.id === activeCategory)) {
      setActiveCategory(nonEmptyCategories[0].id);
    }
  }, [nonEmptyCategories, activeCategory]);

  // Setup scroll event to update active category based on scroll position
  useEffect(() => {
    const handleScroll = () => {
      // Don't trigger if we just programmatically scrolled to a category
      if (scrolledToCategoryRef.current) {
        scrolledToCategoryRef.current = false;
        return;
      }

      // Find all category elements in the DOM
      const categoryElements = allCategoryNames.map(name => document.getElementById(name));
      
      // Filter out null elements and get their positions
      const validElements = categoryElements
        .filter(el => el !== null)
        .map(el => ({
          id: nonEmptyCategories.find(c => c.name === el?.id)?.id || "",
          position: el!.getBoundingClientRect().top
        }));

      // Get the header height (adjust this value based on your fixed header height)
      const headerHeight = 120;

      // Find the element closest to the top of the viewport (after the header)
      const closestElement = validElements
        .filter(el => el.position <= headerHeight + 50) // Add some threshold
        .sort((a, b) => b.position - a.position)[0];

      if (closestElement && closestElement.id !== activeCategory) {
        setActiveCategory(closestElement.id);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [allCategoryNames, nonEmptyCategories, activeCategory]);

  // Filter products based on active store IDs and search query
  const filteredProducts = allProducts.filter(product => {
    // First filter by store
    const storeTag = storeTags.find(tag => tag.name === product.store);
    const storeMatch = storeTag && activeStoreIds.includes(storeTag.id);
    
    // Special case for ICA products from Supabase
    if (product.store === 'ICA') {
      const icaInActiveStores = activeStoreIds.includes('ica');
      if (icaInActiveStores) {
        // If search query is provided, filter by it
        if (!searchQuery) return true;
        
        // Case-insensitive search in product name, details, and category
        const query = searchQuery.toLowerCase();
        return (
          product.name.toLowerCase().includes(query) || 
          product.details.toLowerCase().includes(query) ||
          (product.category && product.category.toLowerCase().includes(query))
        );
      }
      return false;
    }
    
    // Regular case for other stores
    // Then filter by search query if provided
    if (!searchQuery) return storeMatch;
    
    // Case-insensitive search in product name, details, and category
    const query = searchQuery.toLowerCase();
    return storeMatch && (
      product.name.toLowerCase().includes(query) || 
      product.details.toLowerCase().includes(query) ||
      (product.category && product.category.toLowerCase().includes(query))
    );
  });

  const handleCategorySelect = (categoryId: string) => {
    setActiveCategory(categoryId);
    scrolledToCategoryRef.current = true;
    scrollToCategory(categoryId);
  };

  const handleQuantityChange = (productId: string, newQuantity: number, previousQuantity: number) => {
    // Find product details to include when changing quantity
    const product = allProducts.find(p => p.id === productId);
    if (product) {
      // Make sure to always pass the store information
      console.log("Product store info:", product.store);
      
      onProductQuantityChange(
        productId, 
        newQuantity, 
        previousQuantity, 
        {
          name: product.name,
          details: product.details,
          price: product.currentPrice,
          image: product.image,
          store: product.store // Important: Always pass the store property
        }
      );
    } else {
      onProductQuantityChange(productId, newQuantity, previousQuantity);
    }
  };

  return (
    <>
      <div className="px-4 pt-2">
        <StoreTags tags={storeTags} onRemove={onRemoveTag} />
      </div>
      <div className="sticky top-[105px] z-10 bg-white">
        <CategoryTabs
          categories={nonEmptyCategories}
          activeCategory={activeCategory}
          onSelect={handleCategorySelect}
        />
      </div>
      <main className="p-4">
        <ProductGrid
          products={filteredProducts}
          showCategoryHeaders={true}
          onQuantityChange={handleQuantityChange}
          viewMode={viewMode}
          allCategoryNames={allCategoryNames}
        />
      </main>
    </>
  );
};
