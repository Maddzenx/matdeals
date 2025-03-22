
/**
 * Determines the category of a product based on description and name keywords
 */
export const determineProductCategory = (name: string, description: string): string => {
  const lowerName = name.toLowerCase();
  const lowerDesc = description.toLowerCase();
  
  // Combined check of name and description for better categorization
  const combined = lowerName + ' ' + lowerDesc;
  
  // Map Swedish category names directly to category IDs that match what's expected in the UI
  if (combined.includes('grönsak') || combined.includes('frukt') || 
      combined.includes('äpple') || combined.includes('banan') ||
      combined.includes('mango')) {
    return 'fruits';
  } else if (combined.includes('kött') || combined.includes('fläsk') || 
             combined.includes('nöt') || combined.includes('bacon') ||
             combined.includes('kyckl')) {
    return 'meat';
  } else if (combined.includes('fisk') || combined.includes('lax') ||
             combined.includes('torsk') || combined.includes('skaldjur')) {
    return 'fish';
  } else if (combined.includes('mjölk') || combined.includes('ost') || 
             combined.includes('grädde') || combined.includes('yoghurt') ||
             combined.includes('gräddfil')) {
    return 'dairy';
  } else if (combined.includes('snack') || combined.includes('chips') || 
             combined.includes('godis') || combined.includes('choklad')) {
    return 'snacks';
  } else if (combined.includes('bröd') || combined.includes('bulle') ||
             combined.includes('kaka')) {
    return 'bread';
  } else if (combined.includes('dryck') || combined.includes('läsk') ||
             combined.includes('juice') || combined.includes('vatten') ||
             combined.includes('kaffe')) {
    return 'drinks';
  }
  
  return 'other';
};
