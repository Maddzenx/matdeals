
export function formatMemberPrice(product: any): string | undefined {
  // Replace 'kortvara' with 'Medlemspris'
  if (product.is_kortvara) {
    return "Medlemspris";
  }
  return undefined;
}

export function determineProductCategory(name: string, description?: string): string {
  const normalizedName = (name || '').toLowerCase();
  const normalizedDesc = (description || '').toLowerCase();

  if (normalizedName.includes('mjölk') || normalizedName.includes('yoghurt') || normalizedName.includes('ost')) {
    return 'mejeriprodukter';
  } else if (normalizedName.includes('kött') || normalizedName.includes('fläsk') || normalizedName.includes('kyckling')) {
    return 'kött';
  } else if (normalizedName.includes('frukt') || normalizedName.includes('äpple') || normalizedName.includes('banan')) {
    return 'frukt';
  } else if (normalizedName.includes('grönsak') || normalizedName.includes('tomat') || normalizedName.includes('gurka')) {
    return 'grönsaker';
  } else if (normalizedName.includes('bröd') || normalizedName.includes('bulle')) {
    return 'bröd';
  } else {
    return 'övrigt';
  }
}
