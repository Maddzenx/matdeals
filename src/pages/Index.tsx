
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { SearchBar } from "@/components/SearchBar";
import { StoreTags } from "@/components/StoreTags";
import { CategoryTabs } from "@/components/CategoryTabs";
import { ProductGrid } from "@/components/ProductGrid";
import { BottomNav, NavItem } from "@/components/BottomNav";

const Index = () => {
  const navigate = useNavigate();
  const [storeTags] = useState([
    { id: "1", name: "Willys Hornsberg" },
  ]);

  const [categories] = useState([
    { id: "fruits", name: "Frukt & grönt" },
    { id: "meat", name: "Kött & fågel" },
    { id: "dairy", name: "Mejeri & Ägg" },
    { id: "fish", name: "Fisk & Skaldjur" },
    { id: "bread", name: "Bröd & Bageri" },
    { id: "readymeals", name: "Färdigmat" },
    { id: "drinks", name: "Drycker" },
    { id: "snacks", name: "Snacks & Godis" },
    { id: "taco", name: "Tacos" },
  ]);

  const [activeCategory, setActiveCategory] = useState("fruits");
  
  const [cartCount, setCartCount] = useState(0);

  const [navItems, setNavItems] = useState<NavItem[]>([
    { id: "offers", icon: "discount", label: "Erbjudanden", active: true },
    { id: "recipes", icon: "book", label: "Recept" },
    { id: "menu", icon: "search", label: "Matsedel" },
    { id: "cart", icon: "shopping-cart", label: "Inköpslista" },
    { id: "profile", icon: "user", label: "Profil" },
  ]);

  useEffect(() => {
    setNavItems(prev => 
      prev.map(item => 
        item.id === "cart" 
          ? { ...item, badge: cartCount > 0 ? cartCount : undefined } 
          : item
      )
    );
  }, [cartCount]);

  const products = {
    fruits: [
      {
        id: "lime1",
        image: "https://assets.icanet.se/e_sharpen:80,q_auto,dpr_1.25,w_718,h_718,c_lfill/imagevaultfiles/id_186937/cf_259/lime.jpg",
        name: "Lime 3 för",
        details: "Brasilien, Mexico, Colombia, Klass 1, Jämförpris 44:44 kr/kg",
        currentPrice: "10:00 kr",
        originalPrice: "",
        store: "Willys Hornsberg",
        offerBadge: "3 för 10",
      },
      {
        id: "zucchini1",
        image: "https://assets.icanet.se/e_sharpen:80,q_auto,dpr_1.25,w_718,h_718,c_lfill/imagevaultfiles/id_105032/cf_259/zucchini.jpg",
        name: "Zucchini",
        details: "Spanien, Klass 1, Jämförpris 27:50 kr/kg, Max 3 kg/hushåll",
        currentPrice: "9:90 kr/st",
        originalPrice: "",
        store: "Willys Hornsberg",
      },
      {
        id: "tulpaner1",
        image: "https://assets.icanet.se/e_sharpen:80,q_auto,dpr_1.25,w_718,h_718,c_lfill/imagevaultfiles/id_230455/cf_259/tulpaner%2C_10-pack.jpg",
        name: "Tulpaner 7-pack",
        details: "Från Sverige",
        currentPrice: "49:90 kr/förp",
        originalPrice: "",
        store: "Willys Hornsberg",
      },
      {
        id: "isbergssallad1",
        image: "https://assets.icanet.se/e_sharpen:80,q_auto,dpr_1.25,w_718,h_718,c_lfill/imagevaultfiles/id_106111/cf_259/isbergssallad.jpg",
        name: "Isbergssallad",
        details: "Spanien, Klass 1, Jämförpris 19:90 kr/kg, Max 3 kg/hushåll",
        currentPrice: "19:90 kr/kg",
        originalPrice: "",
        store: "Willys Hornsberg",
      },
      {
        id: "purjolok1",
        image: "https://assets.icanet.se/e_sharpen:80,q_auto,dpr_1.25,w_718,h_718,c_lfill/imagevaultfiles/id_106232/cf_259/purjol-k.jpg",
        name: "Purjolök",
        details: "Nederländerna, Klass 1, Jämförpris 19:90 kr/kg, Max 3 kg/hushåll",
        currentPrice: "19:90 kr/kg",
        originalPrice: "",
        store: "Willys Hornsberg",
      },
      {
        id: "gulkiwi1",
        image: "https://assets.icanet.se/e_sharpen:80,q_auto,dpr_1.25,w_718,h_718,c_lfill/imagevaultfiles/id_254177/cf_259/kiwi%2C_god_och_gul.jpg",
        name: "Gul Kiwi 500g",
        details: "Grekland, Italien, Klass 2, Jämförpris 39:80 kr/kg",
        currentPrice: "19:90 kr/förp",
        originalPrice: "",
        store: "Willys Hornsberg",
      },
      {
        id: "rodbetor1",
        image: "https://assets.icanet.se/e_sharpen:80,q_auto,dpr_1.25,w_718,h_718,c_lfill/imagevaultfiles/id_106219/cf_259/r-dbetor.jpg",
        name: "Rödbetor i lösvikt",
        details: "Sverige, Klass 1, Jämförpris 9:90 kr/kg",
        currentPrice: "9:90 kr/kg",
        originalPrice: "",
        store: "Willys Hornsberg",
      },
      {
        id: "gullok1",
        image: "https://assets.icanet.se/e_sharpen:80,q_auto,dpr_1.25,w_718,h_718,c_lfill/imagevaultfiles/id_209064/cf_259/gul_l-k.jpg",
        name: "Gul Lök 1kg",
        details: "Sverige, Klass 1, Jämförpris 9:90 kr/kg",
        currentPrice: "9:90 kr/förp",
        originalPrice: "",
        store: "Willys Hornsberg",
      },
      {
        id: "morotter1",
        image: "https://assets.icanet.se/e_sharpen:80,q_auto,dpr_1.25,w_718,h_718,c_lfill/imagevaultfiles/id_209077/cf_259/mor-tter.jpg",
        name: "Morötter 1kg",
        details: "Sverige, Klass 1, Jämförpris 9:90 kr/kg",
        currentPrice: "9:90 kr/förp",
        originalPrice: "",
        store: "Willys Hornsberg",
      },
      {
        id: "apple1",
        image: "https://assets.icanet.se/e_sharpen:80,q_auto,dpr_1.25,w_718,h_718,c_lfill/imagevaultfiles/id_253886/cf_259/aeple_ingrid_marie.jpg",
        name: "Äpple Ingrid Marie",
        details: "Sverige, Klass 1, Jämförpris 19:90 kr/kg, Max 3 kg/hushåll",
        currentPrice: "19:90 kr/kg",
        originalPrice: "",
        store: "Willys Hornsberg",
      },
    ],
    meat: [
      {
        id: "pulled-pork1",
        image: "https://assets.icanet.se/e_sharpen:80,q_auto,dpr_1.25,w_718,h_718,c_lfill/imagevaultfiles/id_259532/cf_259/pulled_pork%2C_original.jpg",
        name: "Pulled Pork",
        details: "Tulip, 400g-450g, Olika sorter, Jämförpris 99:78-112:25 kr/kg, Max 3 förp/hushåll",
        currentPrice: "44:90 kr/förp",
        originalPrice: "59:90 kr/förp",
        store: "Willys Hornsberg",
        offerBadge: "SPARA 15:00",
      },
      {
        id: "blandfars1",
        image: "https://assets.icanet.se/e_sharpen:80,q_auto,dpr_1.25,w_718,h_718,c_lfill/imagevaultfiles/id_255642/cf_259/blafars.jpg",
        name: "Blandfärs",
        details: "Garant, Sverige, 20%, 500g, Jämförpris 89:80 kr/kg, Max 3 förp/hushåll",
        currentPrice: "44:90 kr/förp",
        originalPrice: "49:90 kr/förp",
        store: "Willys Hornsberg",
        offerBadge: "SPARA 5:00",
      },
      {
        id: "kycklingfars1",
        image: "https://assets.icanet.se/e_sharpen:80,q_auto,dpr_1.25,w_718,h_718,c_lfill/imagevaultfiles/id_129307/cf_259/kycklingfars.jpg",
        name: "Kycklingfärs",
        details: "Kronfågel, Sverige, 1kg, Jämförpris 79:90 kr/kg, Max 3 förp/hushåll",
        currentPrice: "79:90 kr/förp",
        originalPrice: "99:90 kr/förp",
        store: "Willys Hornsberg",
        offerBadge: "SPARA 20:00",
      },
      {
        id: "minutfile1",
        image: "https://assets.icanet.se/e_sharpen:80,q_auto,dpr_1.25,w_718,h_718,c_lfill/imagevaultfiles/id_267023/cf_259/strimlor%2C_kycklingfile.jpg",
        name: "Minutfilé Kycklingstrimlor",
        details: "Kronfågel, Sverige, 550g-600g, Jämförpris 124:83-136:18 kr/kg, Max 3 förp/hushåll",
        currentPrice: "74:90 kr/förp",
        originalPrice: "89:90 kr/förp",
        store: "Willys Hornsberg",
        offerBadge: "SPARA 15:00",
      },
      {
        id: "flaskytterfile1",
        image: "https://assets.icanet.se/e_sharpen:80,q_auto,dpr_1.25,w_718,h_718,c_lfill/imagevaultfiles/id_214950/cf_259/flaskytterfile.jpg",
        name: "Fläskytterfilé",
        details: "Nybergs Deli, Sverige, Ca 1kg, Jämförpris 69:90 kr/kg, Max 3 förp/hushåll",
        currentPrice: "69:90 kr/kg",
        originalPrice: "102:00 kr/kg",
        store: "Willys Hornsberg",
        offerBadge: "SPARA 32:10 PER KG",
      },
    ],
    dairy: [
      {
        id: "egg1",
        image: "https://assets.icanet.se/e_sharpen:80,q_auto,dpr_1.25,w_718,h_718,c_lfill/imagevaultfiles/id_258633/cf_259/aegg%2C_frigaende.jpg",
        name: "Ekologiska Ägg 6-pack",
        details: "Garant Eko, Från frigående höns, 6-pack, Stolek L, Jämförpris 3:65 kr/st",
        currentPrice: "21:90 kr/förp",
        originalPrice: "27:90 kr/förp",
        store: "Willys Hornsberg",
        offerBadge: "SPARA 6:00",
      },
      {
        id: "farskost1",
        image: "https://assets.icanet.se/e_sharpen:80,q_auto,dpr_1.25,w_718,h_718,c_lfill/imagevaultfiles/id_106271/cf_259/philadelphia%2C_original.jpg",
        name: "Färskost",
        details: "Philadelphia, 145-200g, Flera olika sorter, Jämförpris 89:50-123:45 kr/kg, Max 3 förp/hushåll",
        currentPrice: "17:90 kr/förp",
        originalPrice: "29:90 kr/förp",
        store: "Willys Hornsberg",
        offerBadge: "SPARA 5:00-12:00",
      },
      {
        id: "skivadost1",
        image: "https://assets.icanet.se/e_sharpen:80,q_auto,dpr_1.25,w_718,h_718,c_lfill/imagevaultfiles/id_207909/cf_259/ost%2C_gouda_skivad.jpg",
        name: "Skivad Ost",
        details: "Emborg, 150g, Gouda Edamer, Jämförpris 99:33 kr/kg, Max 5 förp/hushåll",
        currentPrice: "14:90 kr/förp",
        originalPrice: "21:90 kr/förp",
        store: "Willys Hornsberg",
        offerBadge: "SPARA 7:00",
      },
      {
        id: "bordsmargarin1",
        image: "https://assets.icanet.se/e_sharpen:80,q_auto,dpr_1.25,w_718,h_718,c_lfill/imagevaultfiles/id_258722/cf_259/laetta%2C_original.jpg",
        name: "Bordsmargarin",
        details: "Lätta, 600g, Olika sorter, Jämförpris: 33:17 kr/kg, Max 3 förp/hushåll",
        currentPrice: "19:90 kr/förp",
        originalPrice: "29:90 kr/förp",
        store: "Willys Hornsberg",
        offerBadge: "SPARA 4:60-10:00",
      },
    ],
    fish: [
      {
        id: "handskalarakor1",
        image: "https://assets.icanet.se/e_sharpen:80,q_auto,dpr_1.25,w_718,h_718,c_lfill/imagevaultfiles/id_153323/cf_259/handskaladr_r-kor%2C_i_lake.jpg",
        name: "Handskalade Räkor",
        details: "Falkenberg, 340/280g, Jämförpris 285:36 kr/kg, Max 3 förp/hushåll",
        currentPrice: "79:90 kr/förp",
        originalPrice: "91:90 kr/förp",
        store: "Willys Hornsberg",
        offerBadge: "SPARA 12:00",
      },
      {
        id: "skagenrora1",
        image: "https://assets.icanet.se/e_sharpen:80,q_auto,dpr_1.25,w_718,h_718,c_lfill/imagevaultfiles/id_231156/cf_259/skagenr-ra.jpg",
        name: "Skagenröra",
        details: "Rydbergs, 200g, Jämförpris 114:50 kr/kg",
        currentPrice: "22:90 kr/förp",
        originalPrice: "28:90 kr/förp",
        store: "Willys Hornsberg",
        offerBadge: "SPARA 6:00",
      },
      {
        id: "varmroktlax1",
        image: "https://assets.icanet.se/e_sharpen:80,q_auto,dpr_1.25,w_718,h_718,c_lfill/imagevaultfiles/id_125811/cf_259/varmr-kt_lax.jpg",
        name: "Varmrökt Lax",
        details: "Isfjord Norway, Ca 1kg, Jämförpris 109:00 kr/kg, Max 3 förp/hushåll",
        currentPrice: "109:00 kr/kg",
        originalPrice: "139:00 kr/kg",
        store: "Willys Hornsberg",
        offerBadge: "SPARA 30:00 PER KG",
      },
      {
        id: "laxfile1",
        image: "https://assets.icanet.se/e_sharpen:80,q_auto,dpr_1.25,w_718,h_718,c_lfill/imagevaultfiles/id_262452/cf_259/laxfile%2C_4-pack.jpg",
        name: "Laxfilé 4-pack",
        details: "Omega, 500g, Jämförpris 159:80 kr/kg, Max 3 förp/hushåll",
        currentPrice: "79:90 kr/förp",
        originalPrice: "95:90 kr/förp",
        store: "Willys Hornsberg",
        offerBadge: "SPARA 16:00",
      },
    ],
    snacks: [
      {
        id: "toffifee1",
        image: "https://assets.icanet.se/e_sharpen:80,q_auto,dpr_1.25,w_718,h_718,c_lfill/imagevaultfiles/id_237261/cf_259/toffifee.jpg",
        name: "Toffifee",
        details: "Toffifee, 125g, Jämförpris 143:20 kr/kg",
        currentPrice: "17:90 kr/förp",
        originalPrice: "25:90 kr/förp",
        store: "Willys Hornsberg",
        offerBadge: "SPARA 8:00",
      },
      {
        id: "donut1",
        image: "https://assets.icanet.se/e_sharpen:80,q_auto,dpr_1.25,w_718,h_718,c_lfill/imagevaultfiles/id_145756/cf_259/donut%2C_original.jpg",
        name: "Donut",
        details: "La Lorraine, 50-58g, Flera olika sorter, Jämförpris 86:21-100:00 kr/kg, Max 3 förp/hushåll",
        currentPrice: "5:00 kr/st",
        originalPrice: "7:50 kr/st",
        store: "Willys Hornsberg",
        offerBadge: "4 FÖR 20:00",
      },
      {
        id: "cashew1",
        image: "https://assets.icanet.se/e_sharpen:80,q_auto,dpr_1.25,w_718,h_718,c_lfill/imagevaultfiles/id_260030/cf_259/cashewnoetter%2C_saltade.jpg",
        name: "Cashewnötter",
        details: "Nöttesfabriken, 250g, Jämförpris 199:60 kr/kg",
        currentPrice: "49:90 kr/förp",
        originalPrice: "59:90 kr/förp",
        store: "Willys Hornsberg",
        offerBadge: "SPARA 10:00",
      },
      {
        id: "chips1",
        image: "https://assets.icanet.se/e_sharpen:80,q_auto,dpr_1.25,w_718,h_718,c_lfill/imagevaultfiles/id_255701/cf_259/olw%2C_naturchips.jpg",
        name: "Chips, Ostsnacks",
        details: "OLW, 100-275g, Flera olika sorter, Gäller ej Cheez doodles, grand och dill-chips, Jämförpris 87:27-190:00 kr/kg",
        currentPrice: "12:00 kr/st",
        originalPrice: "32:90 kr/st",
        store: "Willys Hornsberg",
        offerBadge: "4 FÖR 48:00",
      },
    ],
    taco: [
      {
        id: "tacokyck1",
        image: "https://assets.icanet.se/e_sharpen:80,q_auto,dpr_1.25,w_718,h_718,c_lfill/imagevaultfiles/id_261865/cf_259/taco_kycklingfile_strips.jpg",
        name: "Tacokycklingfilé",
        details: "Guldfågeln, 500g-600g, Djupfryst, Jämförpris 128:17-153:80 kr/kg",
        currentPrice: "76:90 kr/förp",
        originalPrice: "86:90 kr/förp",
        store: "Willys Hornsberg",
        offerBadge: "SPARA 10:00-20:00",
      },
      {
        id: "graddfil1",
        image: "https://assets.icanet.se/e_sharpen:80,q_auto,dpr_1.25,w_718,h_718,c_lfill/imagevaultfiles/id_258723/cf_259/graeddfil.jpg",
        name: "Gräddfil",
        details: "Garant, 5dl, 12%, Jämförpris 35:80 kr/l",
        currentPrice: "17:90 kr/förp",
        originalPrice: "22:50 kr/förp",
        store: "Willys Hornsberg",
      },
      {
        id: "rivenoft1",
        image: "https://assets.icanet.se/e_sharpen:80,q_auto,dpr_1.25,w_718,h_718,c_lfill/imagevaultfiles/id_266988/cf_259/riven_ost%2C_tex_mex.jpg",
        name: "Riven Ost",
        details: "Garant, 150g, Flera olika sorter, Jämförpris 132:67 kr/kg, Max 3 förp/hushåll",
        currentPrice: "19:90 kr/förp",
        originalPrice: "24:90 kr/förp",
        store: "Willys Hornsberg",
        offerBadge: "SPARA 5:00",
      },
      {
        id: "tortilla1",
        image: "https://assets.icanet.se/e_sharpen:80,q_auto,dpr_1.25,w_718,h_718,c_lfill/imagevaultfiles/id_266958/cf_259/tortillabrod%2C_mini_8-pack.jpg",
        name: "Tortillabröd Mini 8-pack",
        details: "Banderos, 320g, Jämförpris 74:50 kr/kg",
        currentPrice: "14:90 kr/förp",
        originalPrice: "22:90 kr/förp",
        store: "Willys Hornsberg",
        offerBadge: "SPARA 8:00",
      },
      {
        id: "dipguaca1",
        image: "https://assets.icanet.se/e_sharpen:80,q_auto,dpr_1.25,w_718,h_718,c_lfill/imagevaultfiles/id_186602/cf_259/dip%2C_guacamole.jpg",
        name: "Dip Guacamole",
        details: "Santa Maria, 250g, Jämförpris 111:60 kr/kg",
        currentPrice: "27:90 kr/förp",
        originalPrice: "31:90 kr/förp",
        store: "Willys Hornsberg",
        offerBadge: "SPARA 4:00",
      },
    ],
  };

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

  const handleProductQuantityChange = (productId: string, newQuantity: number, previousQuantity: number) => {
    const quantityDifference = newQuantity - previousQuantity;
    setCartCount(prev => Math.max(0, prev + quantityDifference));
  };

  // Flatten all products and add category information
  const allProducts = React.useMemo(() => {
    const result: any[] = [];
    
    Object.entries(products).forEach(([categoryId, categoryProducts]) => {
      const categoryName = categories.find(c => c.id === categoryId)?.name || "";
      categoryProducts.forEach(product => {
        result.push({
          ...product,
          category: categoryName
        });
      });
    });
    
    return result;
  }, [products, categories]);

  const handleCategorySelect = (categoryId: string) => {
    setActiveCategory(categoryId);
    
    // Scroll to category section
    const categoryName = categories.find(c => c.id === categoryId)?.name || "";
    const element = document.getElementById(categoryName);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
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
        <StoreTags tags={storeTags} onRemove={handleRemoveTag} />
        <CategoryTabs
          categories={categories}
          activeCategory={activeCategory}
          onSelect={handleCategorySelect}
        />
        <main className="p-4">
          <ProductGrid
            products={allProducts}
            showCategoryHeaders={true}
            onQuantityChange={handleProductQuantityChange}
          />
        </main>
        <BottomNav items={navItems} onSelect={handleNavSelect} />
      </div>
    </>
  );
};

export default Index;
