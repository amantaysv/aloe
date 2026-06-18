export type Product = {
  id: number;
  external_id: string;
  name: string;
  price: number;
  image_url: string;
  product_url: string;
  category: string;
  category_id: string;
  is_popular?: boolean;
  is_new?: boolean;
  is_sale?: boolean;
  is_discount?: boolean;
  old_price?: number | null;
};
