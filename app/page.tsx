import type { Metadata } from "next";
import { BannerCarousel, Header, MainContainer, ProductCarousel, Title } from "@/components";
import {
  getCachedActiveBanners,
  getCachedCategoriesWithSlug,
  getCachedHomePageCategoryProducts,
  getCachedPopularProducts,
  getCachedProductsByLabel,
} from "@/lib/cached-queries";

export const metadata: Metadata = {
  title: { absolute: "Aloe.kg — бытовая химия и косметика с доставкой по Бишкеку" },
  description:
    "Интернет-магазин Aloe.kg: бытовая химия, косметика и товары для дома по выгодным ценам. Доставка по Бишкеку в день заказа.",
  alternates: { canonical: "/" },
};

export default async function HomePage() {
  const [popular, newest, onSale, desktopBanners, mobileBanners, allCategories] = await Promise.all([
    getCachedPopularProducts(),
    getCachedProductsByLabel("new"),
    getCachedProductsByLabel("sale"),
    getCachedActiveBanners("desktop"),
    getCachedActiveBanners("mobile"),
    getCachedCategoriesWithSlug(),
  ]);

  const topCategories = allCategories.filter((c) => !c.parent_id);

  const subsByParent = new Map<number, number[]>();
  for (const c of allCategories) {
    if (c.parent_id) {
      if (!subsByParent.has(c.parent_id)) subsByParent.set(c.parent_id, []);
      subsByParent.get(c.parent_id)!.push(c.id);
    }
  }

  const groups = topCategories.map((cat) => {
    const subIds = subsByParent.get(cat.id) ?? [];
    const subSubIds = subIds.flatMap((id) => subsByParent.get(id) ?? []);
    return { topId: cat.id, allIds: [cat.id, ...subIds, ...subSubIds] };
  });
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
        {/* The carousels below are h2s; without this the site's most important page had no h1. */}
        <Title className="sr-only">Бытовая химия и косметика с доставкой по Бишкеку</Title>
        <div className="block md:hidden">
          <BannerCarousel banners={mobileBanners} />
        </div>
        <div className="hidden md:block">
          <BannerCarousel banners={desktopBanners} />
        </div>
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
