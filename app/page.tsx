import { supabase } from "@/lib/supabase";
import ProductCarousel from "@/components/ProductCarousel";
import type { Product } from "@/types";

async function getTaggedProducts(flag: "is_popular" | "is_new" | "is_sale" | "is_discount"): Promise<Product[]> {
  const { data } = await supabase
    .from("products")
    .select("*")
    .eq(flag, true)
    .limit(20);
  return data || [];
}

export default async function HomePage() {
  const [popular, newest, onSale, discounted] = await Promise.all([
    getTaggedProducts("is_popular"),
    getTaggedProducts("is_new"),
    getTaggedProducts("is_sale"),
    getTaggedProducts("is_discount"),
  ]);

  const hasAny = popular.length || newest.length || onSale.length || discounted.length;

  return (
    <main className="max-w-6xl mx-auto px-4 py-8">
      {popular.length > 0    && <ProductCarousel title="Популярные товары" href="/popular"  products={popular} />}
      {newest.length > 0     && <ProductCarousel title="Новинки"           href="/new"      products={newest} />}
      {onSale.length > 0     && <ProductCarousel title="Акции"             href="/sale"     products={onSale} />}
      {discounted.length > 0 && <ProductCarousel title="Скидки"            href="/discount" products={discounted} />}
      {!hasAny && (
        <p className="text-gray-400 text-sm">Выберите категорию из меню слева</p>
      )}
    </main>
  );
}
