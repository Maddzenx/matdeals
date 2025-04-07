export function determineProductCategory(name: string, description: string): string {
  const lowerName = name.toLowerCase();
  const lowerDescription = description.toLowerCase();

  if (lowerName.includes('äpple') || lowerName.includes('frukt') || lowerName.includes('grönt') ||
      lowerName.includes('banan') || lowerName.includes('tomat') || lowerName.includes('gurka')) {
    return 'fruits';
  }

  if (lowerName.includes('bröd') || lowerName.includes('bageri') ||
      lowerName.includes('kaka') || lowerName.includes('bulle')) {
    return 'bread';
  }

  if (lowerName.includes('kött') || lowerName.includes('fläsk') ||
      lowerName.includes('nöt') || lowerName.includes('kyckl')) {
    return 'meat';
  }

  if (lowerName.includes('ost') || lowerName.includes('mjölk') ||
      lowerName.includes('fil') || lowerName.includes('yog')) {
    return 'dairy';
  }

  if (lowerName.includes('dryck') || lowerName.includes('juice') ||
      lowerName.includes('vatten') || lowerName.includes('läsk')) {
    return 'beverages';
  }

  return 'other';
}

// Add a new helper function for member price formatting
export const formatMemberPrice = ({ is_kortvara }: { is_kortvara?: boolean }): string => {
  if (is_kortvara) {
    return 'Kortpris';
  }
  return 'Erbjudande';
};
