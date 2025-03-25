
/**
 * Determines product category based on product name and details
 */
export const determineProductCategory = (productName: string, details: string = ''): string => {
  // Convert to lowercase for case-insensitive matching
  const name = productName.toLowerCase();
  const productDetails = details.toLowerCase();
  const combinedText = `${name} ${productDetails}`;
  
  // Fruits & Vegetables
  if (
    combinedText.includes('frukt') ||
    combinedText.includes('äpple') ||
    combinedText.includes('banan') ||
    combinedText.includes('päron') ||
    combinedText.includes('citron') ||
    combinedText.includes('lime') ||
    combinedText.includes('kiwi') ||
    combinedText.includes('melon') ||
    combinedText.includes('ananas') ||
    combinedText.includes('avokado') ||
    combinedText.includes('bär') ||
    combinedText.includes('jordgubb') ||
    combinedText.includes('hallon') ||
    combinedText.includes('blåbär')
  ) {
    return 'fruits';
  }
  
  // Vegetables
  if (
    combinedText.includes('grönsak') ||
    combinedText.includes('tomat') ||
    combinedText.includes('gurka') ||
    combinedText.includes('sallad') ||
    combinedText.includes('lök') ||
    combinedText.includes('purjolök') ||
    combinedText.includes('morot') ||
    combinedText.includes('potatis') ||
    combinedText.includes('paprika') ||
    combinedText.includes('zucchini') ||
    combinedText.includes('broccoli') ||
    combinedText.includes('blomkål') ||
    combinedText.includes('svamp') ||
    combinedText.includes('rödbeta')
  ) {
    return 'vegetables';
  }
  
  // Sometimes fruits and vegetables might be grouped in the same category
  if (combinedText.includes('grönt')) {
    return 'fruits';
  }
  
  // Meat
  if (
    combinedText.includes('kött') ||
    combinedText.includes('nöt') ||
    combinedText.includes('fläsk') ||
    combinedText.includes('fläskkarré') ||
    combinedText.includes('kyckling') ||
    combinedText.includes('kalkun') ||
    combinedText.includes('korv') ||
    combinedText.includes('bacon') ||
    combinedText.includes('färs') ||
    combinedText.includes('köttfärs') ||
    combinedText.includes('kycklingfilé') ||
    combinedText.includes('pulled pork') ||
    combinedText.includes('köttbulle') ||
    combinedText.includes('falukorv') ||
    combinedText.includes('chorizo') ||
    combinedText.includes('salami')
  ) {
    return 'meat';
  }
  
  // Fish
  if (
    combinedText.includes('fisk') ||
    combinedText.includes('lax') ||
    combinedText.includes('torsk') ||
    combinedText.includes('räkor') ||
    combinedText.includes('sill') ||
    combinedText.includes('tonfisk') ||
    combinedText.includes('kaviar') ||
    combinedText.includes('fiskpinnar') ||
    combinedText.includes('seafood') ||
    combinedText.includes('skaldjur')
  ) {
    return 'fish';
  }
  
  // Dairy
  if (
    combinedText.includes('mejeri') ||
    combinedText.includes('mjölk') ||
    combinedText.includes('ost') ||
    combinedText.includes('smör') ||
    combinedText.includes('yoghurt') ||
    combinedText.includes('fil') ||
    combinedText.includes('grädde') ||
    combinedText.includes('kvarg') ||
    combinedText.includes('ägg') ||
    combinedText.includes('crème fraiche') ||
    combinedText.includes('margarin') ||
    combinedText.includes('bregott') ||
    combinedText.includes('cream cheese') ||
    combinedText.includes('cottage cheese') ||
    combinedText.includes('färskost')
  ) {
    return 'dairy';
  }
  
  // Bread
  if (
    combinedText.includes('bröd') ||
    combinedText.includes('limpa') ||
    combinedText.includes('toast') ||
    combinedText.includes('knäcke') ||
    combinedText.includes('bulle') ||
    combinedText.includes('kaka') ||
    combinedText.includes('bagett') ||
    combinedText.includes('croissant')
  ) {
    return 'bread';
  }
  
  // Snacks
  if (
    combinedText.includes('snacks') ||
    combinedText.includes('chips') ||
    combinedText.includes('choklad') ||
    combinedText.includes('godis') ||
    combinedText.includes('nötter') ||
    combinedText.includes('cashew') ||
    combinedText.includes('ostbågar') ||
    combinedText.includes('popcorn') ||
    combinedText.includes('toffifee') ||
    combinedText.includes('donut') ||
    combinedText.includes('glass')
  ) {
    return 'snacks';
  }
  
  // Drinks
  if (
    combinedText.includes('dryck') ||
    combinedText.includes('läsk') ||
    combinedText.includes('saft') ||
    combinedText.includes('juice') ||
    combinedText.includes('vatten') ||
    combinedText.includes('öl') ||
    combinedText.includes('vin') ||
    combinedText.includes('kaffe') ||
    combinedText.includes('te') ||
    combinedText.includes('coca-cola') ||
    combinedText.includes('pepsi') ||
    combinedText.includes('fanta') ||
    combinedText.includes('sprite')
  ) {
    return 'drinks';
  }
  
  // Default to 'other' if no matches
  return 'other';
};
