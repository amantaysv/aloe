import { notFound } from "next/navigation";
import { MainContainer, MobileHeader, SubcategoryFilter, VirtualCategoryContent } from "@/components";
import { getCachedCategoriesWithSlug, getCachedSubcategorySection } from "@/lib/cached-queries";
import { parseBrandIds, parseSortParam } from "@/lib/page-params";

export default async function SubcategoryPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string; subSlug: string }>;
  searchParams: Promise<{ brand?: string | string[]; sort?: string }>;
}) {
  const [{ slug, subSlug }, sp] = await Promise.all([params, searchParams]);
  const selectedBrandIds = parseBrandIds(sp.brand);
  const validSort = parseSortParam(sp.sort);

  const allCategories = await getCachedCategoriesWithSlug();

  const parentCategory = allCategories?.find((c) => c.slug === slug && c.parent_id === null);
  if (!parentCategory) notFound();

  const subcategory = allCategories?.find((c) => c.slug === subSlug && c.parent_id === parentCategory.id);
  if (!subcategory) notFound();

  const { products, total } = await getCachedSubcategorySection(String(subcategory.id), validSort, selectedBrandIds);

  if (!total && selectedBrandIds.length === 0) notFound();

  return (
    <>
      <MobileHeader title={parentCategory.name} />

      <SubcategoryFilter
        subcategories={allCategories.filter((c) => c.parent_id === parentCategory.id)}
        categorySlug={slug}
        activeSubSlug={subSlug}
      />

      <MainContainer>
        {products.length === 0 ? (
          <p className="text-gray-500 py-8 text-center">По выбранным фильтрам ничего не найдено</p>
        ) : (
          <VirtualCategoryContent sections={[{ id: subcategory.id, name: subcategory.name, products }]} />
        )}
      </MainContainer>
    </>
  );
}
