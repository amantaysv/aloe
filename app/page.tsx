import { BannerCarousel, Header, MainContainer, ProductCarousel } from "@/components";
import {
  getCachedActiveBanners,
  getCachedCategoriesWithSlug,
  getCachedHomePageCategoryProducts,
  getCachedProductsByLabel,
} from "@/lib/cached-queries";

export default async function HomePage() {
  const [popular, newest, onSale, banners, allCategories] = await Promise.all([
    getCachedProductsByLabel("popular"),
    getCachedProductsByLabel("new"),
    getCachedProductsByLabel("sale"),
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
    <>
      <Header className="block md:hidden" />
      <MainContainer className="flex flex-col gap-4 md:gap-8">
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
      </MainContainer>
    </>
  );
}
