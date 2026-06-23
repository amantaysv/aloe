import BannerCarousel from "@/components/BannerCarousel";
import ProductCarousel from "@/components/ProductCarousel";
import {
  getCachedActiveBanners,
  getCachedCategoriesWithSlug,
  getCachedProductsByCategories,
  getCachedProductsByLabel,
} from "@/lib/cached-queries";

export default async function HomePage() {
  const [popular, newest, onSale, discounted, banners, allCategories] = await Promise.all([
    getCachedProductsByLabel("popular"),
    getCachedProductsByLabel("new"),
    getCachedProductsByLabel("sale"),
    getCachedProductsByLabel("discount"),
    getCachedActiveBanners(),
    getCachedCategoriesWithSlug(),
  ]);

  const topCategories = allCategories.filter((c) => !c.parent_id);

  const subsByParent = new Map<string, string[]>();
  for (const c of allCategories) {
    if (c.parent_id) {
      if (!subsByParent.has(c.parent_id)) subsByParent.set(c.parent_id, []);
      subsByParent.get(c.parent_id)!.push(c.id);
    }
  }

  const categoryProducts = await Promise.all(
    topCategories.map(async (cat) => {
      const ids = [cat.id, ...(subsByParent.get(cat.id) ?? [])];
      const { products, total } = await getCachedProductsByCategories(ids);
      return { cat, products, total };
    }),
  );

  return (
    <main className="max-w-6xl mx-auto px-4 py-8">
      <BannerCarousel banners={banners} />
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
          ),
      )}
    </main>
  );
}
