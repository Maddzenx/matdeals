
export type Product = {
  name: string;
  description: string;
  price: number | null;
  image_url: string;
  original_price?: number | null;
  comparison_price?: string;
  offer_details?: string;
  quantity_info?: string;
};
