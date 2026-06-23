import BannerCarousel from "@/components/BannerCarousel";
import ProductCarousel from "@/components/ProductCarousel";
import { supabase } from "@/lib/supabase";
import type { ProductRow } from "@/types";
import { withBrandName } from "@/types";

async function getTaggedProducts(label: "popular" | "new" | "sale" | "discount") {
  const { data, count } = await supabase.from("products").select("*, brands(name)", { count: "exact" }).eq("published", true).eq("label", label).limit(10);
  return { products: withBrandName((data ?? []) as unknown as ProductRow[]), total: count ?? 0 };
}

export default async function HomePage() {
  const [popular, newest, onSale, discounted, { data: banners }, { data: allCategories }] = await Promise.all([
    getTaggedProducts("popular"),
    getTaggedProducts("new"),
    getTaggedProducts("sale"),
    getTaggedProducts("discount"),
    supabase.from("banners").select("id, image_url").eq("active", true).order("sort_order"),
    supabase.from("categories").select("id, name, parent_id, slug"),
  ]);

  const topCategories = (allCategories ?? []).filter((c) => !c.parent_id);

  const subsByParent = new Map<string, string[]>();
  for (const c of allCategories ?? []) {
    if (c.parent_id) {
      if (!subsByParent.has(c.parent_id)) subsByParent.set(c.parent_id, []);
      subsByParent.get(c.parent_id)!.push(c.id);
    }
  }

  const categoryProducts = await Promise.all(
    topCategories.map(async (cat) => {
      const ids = [cat.id, ...(subsByParent.get(cat.id) ?? [])];
      const { data, count } = await supabase
        .from("products")
        .select("*, brands(name)", { count: "exact" })
        .eq("published", true)
        .in("category_id", ids)
        .limit(10);
      return { cat, products: withBrandName((data ?? []) as unknown as ProductRow[]), total: count ?? 0 };
    })
  );

  return (
    <main className="max-w-6xl mx-auto px-4 py-8">
      <BannerCarousel banners={banners ?? []} />
      {popular.total > 0 && (
        <ProductCarousel
          title="Популярные товары"
          href="/popular"
          products={popular.products}
          totalCount={popular.total}
        />
      )}
      {newest.total > 0 && (
        <ProductCarousel title="Новинки" href="/new" products={newest.products} totalCount={newest.total} />
      )}
      {onSale.total > 0 && (
        <ProductCarousel title="Акции" href="/sale" products={onSale.products} totalCount={onSale.total} />
      )}
      {discounted.total > 0 && (
        <ProductCarousel title="Скидки" href="/discount" products={discounted.products} totalCount={discounted.total} />
      )}
      {categoryProducts.map(
        ({ cat, products, total }) =>
          total > 0 && (
            <ProductCarousel
              key={cat.id}
              title={cat.name}
              href={`/catalog/${cat.slug}`}
              products={products}
              totalCount={total}
            />
          )
      )}
    </main>
  );
}
