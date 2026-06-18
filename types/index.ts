export type Product = {
  id: number;
  external_id: string;
  name: string;
  price: number;
  image_url: string;
  product_url: string;
  category: string;
  category_id: string;
  label?: "popular" | "new" | "sale" | "discount" | null;
  old_price?: number | null;
};
