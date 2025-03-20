
import React from "react";
import { ProductCard } from "./ProductCard";

interface Product {
  id: string;
  image: string;
  name: string;
  details: string;
  currentPrice: string;
  originalPrice: string;
  store: string;
  offerBadge?: string;
  category?: string;
}

interface ProductGridProps {
  title?: string;
  products: Product[];
  showCategoryHeaders?: boolean;
  onQuantityChange?: (productId: string, newQuantity: number, previousQuantity: number) => void;
  viewMode?: "grid" | "list";
  className?: string;
  allCategoryNames?: string[];
}

// Swedish translations for common category names
const translateCategory = (name: string): string => {
  const translations: Record<string, string> = {
    "All": "Alla",
    "Fruits & Vegetables": "Frukt & Grönt",
    "Meat": "Kött",
    "Fish": "Fisk",
    "Dairy": "Mejeri",
    "Snacks": "Snacks",
    "Bread": "Bröd",
    "Drinks": "Drycker",
    "Other": "Övrigt",
    // Map our category IDs to display names
    "fruits": "Frukt & Grönt",
    "meat": "Kött",
    "fish": "Fisk",
    "dairy": "Mejeri",
    "snacks": "Snacks",
    "bread": "Bröd",
    "drinks": "Drycker",
    "other": "Övrigt"
  };

  return translations[name] || name;
};

export const ProductGrid: React.FC<ProductGridProps> = ({ 
  title, 
  products,
  showCategoryHeaders = false,
  onQuantityChange,
  viewMode = "grid",
  className = "",
  allCategoryNames = []
}) => {
  // Group products by category if showCategoryHeaders is true
  const groupedProducts = React.useMemo(() => {
    if (!showCategoryHeaders) {
      return { "": products };
    }
    
    const groups: Record<string, Product[]> = {};
    
    // Initialize all categories, even empty ones
    if (allCategoryNames.length > 0) {
      allCategoryNames.forEach(category => {
        groups[category] = [];
      });
    }
    
    // Add products to their respective categories
    products.forEach(product => {
      const category = product.category || "";
      if (!groups[category]) {
        groups[category] = [];
      }
      groups[category].push(product);
    });
    
    // Filter out empty categories
    return Object.fromEntries(
      Object.entries(groups).filter(([_, categoryProducts]) => categoryProducts.length > 0)
    );
  }, [products, showCategoryHeaders, allCategoryNames]);

  // Count total products
  const totalProducts = products.length;
  
  console.log(`ProductGrid rendering ${totalProducts} products in ${viewMode} mode`);
  
  // Additional debug logging
  if (totalProducts > 0) {
    console.log("Sample product:", products[0]);
  } else {
    console.warn("No products to display in ProductGrid");
    console.warn("Products array:", products);
  }

  return (
    <div className={className}>
      {title && <h2 className="text-base font-bold text-[#1C1C1C] mb-3">{title}</h2>}
      
      {totalProducts === 0 ? (
        <div className="text-center py-10 text-gray-500">
          <i className="ti ti-shopping-cart text-3xl mb-3"></i>
          <p>Inga produkter hittades</p>
        </div>
      ) : (
        Object.entries(groupedProducts).map(([category, categoryProducts]) => (
          <div key={category || "uncategorized"}>
            {showCategoryHeaders && category && categoryProducts.length > 0 && (
              <h3 
                id={category} 
                className="text-xl font-bold text-[#1C1C1C] mt-5 mb-4 scroll-mt-[160px]"
                data-category-header="true"
              >
                {translateCategory(category)}
              </h3>
            )}
            {categoryProducts.length > 0 && (
              <div className={`${viewMode === "grid" ? "grid grid-cols-2 gap-2" : "flex flex-col gap-2"} mb-5`}>
                {categoryProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    id={product.id}
                    image={product.image}
                    name={product.name}
                    details={product.details}
                    currentPrice={product.currentPrice}
                    originalPrice={product.originalPrice}
                    store={product.store}
                    offerBadge={product.offerBadge}
                    onQuantityChange={onQuantityChange}
                    viewMode={viewMode}
                  />
                ))}
              </div>
            )}
          </div>
        ))
      )}
    </div>
  );
};
