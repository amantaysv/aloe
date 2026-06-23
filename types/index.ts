export type Brand = {
  id: number;
  name: string;
  slug: string;
};

export type Product = {
  id: number;
  external_id: string;
  name: string;
  price: number;
  image_url: string;
  product_url: string;
  category: string;
  category_id: number;
  label?: "popular" | "new" | "sale" | "discount" | null;
  old_price?: number | null;
  description?: string | null;
  brand_id?: number | null;
  brand_name?: string | null;
  seo_text?: string | null;
};

export type ProductRow = Product & { brands: { name: string } | null };

export function withBrandName(rows: ProductRow[]): Product[] {
  return rows.map((p) => ({ ...p, brand_name: p.brands?.name ?? null }));
}
