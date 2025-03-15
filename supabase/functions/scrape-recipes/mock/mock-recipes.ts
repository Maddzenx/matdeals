
// Generate mock recipe data for testing and fallback

export function createMockRecipes() {
  const recipes = [];
  
  // Pasta Carbonara recipe
  recipes.push({
    id: crypto.randomUUID(),
    title: "Pasta Carbonara",
    description: "En klassisk italiensk pasta med krämig ägg- och ostsås och krispigt stekt fläsk.",
    image_url: "https://assets.icanet.se/e_sharpen:80,q_auto,dpr_1.25,w_718,h_718,c_lfill/imagevaultfiles/id_226493/cf_259/pasta_med_kramig_svamp-_och_baconsas.jpg",
    time_minutes: 25,
    servings: 4,
    difficulty: "Lätt",
    ingredients: [
      "400 g spaghetti",
      "150 g pancetta eller bacon",
      "4 st äggulor",
      "50 g riven parmesanost",
      "2 st vitlöksklyftor",
      "2 msk olivolja",
      "Salt och svartpeppar efter smak",
      "1 dl riven pecorino-ost"
    ],
    instructions: [
      "Koka spagettin enligt anvisningarna på förpackningen i saltat vatten.",
      "Under tiden, tärna pancettan eller bacon och stek i olivolja tills den är krispig.",
      "Pressa vitlöken och tillsätt i pannan, stek i 30 sekunder.",
      "I en skål, vispa äggulorna med den rivna parmesanosten.",
      "När pastan är klar, häll av vattnet men spara cirka 1 dl av kokvattnet.",
      "Blanda den varma pastan med fläskblandningen i pannan (på låg värme).",
      "Ta bort pannan från värmen och rör snabbt ned ägg- och ostblandningen.",
      "Tillsätt lite av pastavattnet om såsen är för tjock.",
      "Smaka av med salt och rikligt med svartpeppar.",
      "Servera omedelbart med extra riven ost på toppen."
    ],
    tags: ["Italienskt", "Middag", "Pasta", "Budget"],
    source_url: "https://www.ica.se/recept/pasta-carbonara-klassisk-722474/",
    category: "Middag",
    price: 65,
    original_price: 85
  });

  // Kycklinggryta med curry
  recipes.push({
    id: crypto.randomUUID(),
    title: "Kycklinggryta med curry",
    description: "En smakrik och krämig kycklinggryta med curry och kokosmjölk, perfekt serverad med ris.",
    image_url: "https://assets.icanet.se/e_sharpen:80,q_auto,dpr_1.25,w_718,h_718,c_lfill/imagevaultfiles/id_65609/cf_259/kycklinggryta_med_curry.jpg",
    time_minutes: 35,
    servings: 4,
    difficulty: "Lätt",
    ingredients: [
      "600 g kycklingfilé",
      "1 st gul lök",
      "2 st vitlöksklyftor",
      "2 msk curry",
      "2 msk olja till stekning",
      "400 ml kokosmjölk",
      "2 dl vatten",
      "2 st hönsbuljongtärningar",
      "1 st röd paprika",
      "1 st gul paprika",
      "1 burk kidneybönor (400 g)",
      "Salt och peppar efter smak",
      "4 portioner ris"
    ],
    instructions: [
      "Skär kycklingen i bitar. Hacka löken och vitlöken fint.",
      "Hetta upp olja i en gryta och bryn kycklingen.",
      "Tillsätt lök, vitlök och curry. Stek under omrörning i 2-3 minuter.",
      "Häll i kokosmjölk, vatten och buljongtärningar. Låt sjuda i 10 minuter.",
      "Skär paprikorna i bitar och skölj av bönorna.",
      "Tillsätt paprika och bönor i grytan och låt sjuda ytterligare 5-7 minuter.",
      "Smaka av med salt och peppar.",
      "Koka riset enligt anvisningarna på förpackningen.",
      "Servera grytan med ris."
    ],
    tags: ["Kyckling", "Middag", "Curry", "Matlådevänligt"],
    source_url: "https://www.ica.se/recept/kycklinggryta-med-curry-712978/",
    category: "Kyckling",
    price: 75,
    original_price: 95
  });

  // Vegetarisk lasagne
  recipes.push({
    id: crypto.randomUUID(),
    title: "Vegetarisk lasagne med linser",
    description: "En smakrik vegetarisk lasagne med linser, tomatsås och bechamelsås.",
    image_url: "https://assets.icanet.se/e_sharpen:80,q_auto,dpr_1.25,w_718,h_718,c_lfill/imagevaultfiles/id_108896/cf_259/vegetarisk_lasagne_med_linser.jpg",
    time_minutes: 60,
    servings: 6,
    difficulty: "Medel",
    ingredients: [
      "2 st morötter",
      "1 st gul lök",
      "2 st vitlöksklyftor",
      "1 st zucchini",
      "2 dl röda linser",
      "2 burkar krossade tomater (à 400 g)",
      "2 msk tomatpuré",
      "2 tsk torkad oregano",
      "1 tsk torkad timjan",
      "1 st grönsaksbuljongtärning",
      "Salt och peppar efter smak",
      "50 g smör",
      "5 msk vetemjöl",
      "7 dl mjölk",
      "2 dl riven ost",
      "12 st lasagneplattor",
      "1 dl riven ost (till gratineringen)"
    ],
    instructions: [
      "Sätt ugnen på 225°C.",
      "Skala och finhacka lök, vitlök och morötter. Fintärna zucchinin.",
      "Fräs grönsakerna i olja i en stor kastrull tills de mjuknat.",
      "Tillsätt linser, krossade tomater, tomatpuré, örter och buljongtärning.",
      "Låt koka på medelvärme i 15-20 minuter. Smaka av med salt och peppar.",
      "Gör under tiden bechamelsås: Smält smöret i en kastrull. Tillsätt mjölet och rör till en jämn redning.",
      "Tillsätt mjölken lite i taget under vispning. Låt sjuda 5 minuter.",
      "Ta från värmen och tillsätt 2 dl riven ost. Smaka av med salt och peppar.",
      "Varva i en ugnsform: tomatsås, lasagneplattor, bechamelsås. Upprepa och avsluta med bechamelsås.",
      "Strö över 1 dl riven ost och gratinera i ugnen ca 25-30 minuter tills lasagnen fått fin färg.",
      "Låt vila 10 minuter före servering."
    ],
    tags: ["Vegetariskt", "Middag", "Pasta", "Matlådevänligt"],
    source_url: "https://www.ica.se/recept/vegetarisk-lasagne-med-linser-718760/",
    category: "Vegetariskt",
    price: 60,
    original_price: 80
  });

  // Laxsoppa
  recipes.push({
    id: crypto.randomUUID(),
    title: "Krämig laxsoppa",
    description: "En lyxig och krämig laxsoppa med dill och potatis. Perfekt för en kylig kväll.",
    image_url: "https://assets.icanet.se/e_sharpen:80,q_auto,dpr_1.25,w_718,h_718,c_lfill/imagevaultfiles/id_166250/cf_259/kramig_laxsoppa.jpg",
    time_minutes: 30,
    servings: 4,
    difficulty: "Lätt",
    ingredients: [
      "400 g laxfilé",
      "1 st gul lök",
      "2 st vitlöksklyftor",
      "500 g potatis",
      "2 msk smör",
      "1 liter fiskbuljong",
      "2 dl grädde",
      "1 knippe dill",
      "1 st citron (skal och juice)",
      "Salt och vitpeppar efter smak",
      "1 msk maizena (vid behov för tjockare konsistens)"
    ],
    instructions: [
      "Skala och tärna potatisen. Finhacka löken och vitlöken.",
      "Smält smöret i en stor kastrull och fräs lök och vitlök utan att de tar färg.",
      "Tillsätt potatisen och fiskbuljongen. Låt koka tills potatisen är mjuk, ca 10-15 minuter.",
      "Skär laxen i kuber.",
      "Tillsätt grädden i soppan och låt koka upp.",
      "Sänk värmen och lägg i laxbitarna. Låt sjuda i ca 5 minuter tills laxen är genomkokt.",
      "Finhacka dillen och tillsätt den tillsammans med citronskal och citronsaft.",
      "Smaka av med salt och vitpeppar.",
      "Om du vill ha tjockare soppa, blanda maizena med lite kallt vatten och rör ner i soppan.",
      "Servera med ett gott bröd."
    ],
    tags: ["Fisk & skaldjur", "Soppa", "Middag"],
    source_url: "https://www.ica.se/recept/kramig-laxsoppa-724570/",
    category: "Fisk & skaldjur",
    price: 90,
    original_price: 110
  });

  // Veganska bönbiffar
  recipes.push({
    id: crypto.randomUUID(),
    title: "Veganska bönbiffar",
    description: "Smakrika och saftiga veganska biffar gjorda på svarta bönor. Perfekta i burgare eller med tillbehör.",
    image_url: "https://assets.icanet.se/e_sharpen:80,q_auto,dpr_1.25,w_718,h_718,c_lfill/imagevaultfiles/id_201713/cf_259/svartbonsbiffar.jpg",
    time_minutes: 40,
    servings: 4,
    difficulty: "Medel",
    ingredients: [
      "2 burkar svarta bönor (à 400 g)",
      "1 st röd lök",
      "2 st vitlöksklyftor",
      "1 dl havregryn",
      "2 msk sojasås",
      "1 msk rökt paprikapulver",
      "1 tsk spiskummin",
      "1 tsk torkad timjan",
      "0.5 dl vetemjöl",
      "Salt och peppar efter smak",
      "3 msk olivolja till stekning"
    ],
    instructions: [
      "Skölj och låt bönorna rinna av ordentligt.",
      "Finhacka löken och vitlöken.",
      "Fräs lök och vitlök i lite olja tills de mjuknat.",
      "Mixa bönorna grovt i en matberedare eller mosa dem för hand.",
      "Blanda bönorna med den frästa löken, havregryn, sojasås och kryddor.",
      "Tillsätt vetemjöl och blanda ordentligt.",
      "Forma smeten till 8 biffar.",
      "Hetta upp olja i en stekpanna och stek biffarna ca 3-4 minuter på varje sida.",
      "Servera med potatis, ris eller i hamburgebröd med tillbehör.",
      "Tips: Biffarna kan även tillagas i ugn, 200°C i ca 20 minuter."
    ],
    tags: ["Veganskt", "Vegetariskt", "Middag", "Bönor"],
    source_url: "https://www.ica.se/recept/veganska-bonbiffar-721467/",
    category: "Veganskt",
    price: 50,
    original_price: 65
  });

  // Add more mock recipes here if needed

  return recipes;
}
