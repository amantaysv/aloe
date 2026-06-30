import { BannerCarousel, Container, ProductCarousel } from "@/components";
import {
  getCachedActiveBanners,
  getCachedCategoriesWithSlug,
  getCachedHomePageCategoryProducts,
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

  const groups = topCategories.map((cat) => ({
    topId: cat.id,
    allIds: [cat.id, ...(subsByParent.get(cat.id) ?? [])],
  }));
  const categoryResults = await getCachedHomePageCategoryProducts(groups);
  const categoryProducts = topCategories.map((cat, i) => ({
    cat,
    products: categoryResults[i].products,
    total: categoryResults[i].total,
  }));

  return (
    <Container className="flex flex-col gap-8" withMain>
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
    </Container>
  );
}
