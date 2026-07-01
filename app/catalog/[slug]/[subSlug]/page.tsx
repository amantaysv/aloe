import { notFound } from "next/navigation";
import {
  MainContainer,
  ManufacturerFilter,
  MobileHeader,
  Pagination,
  ProductCard,
  ProductGrid,
  SortSelect,
  SubcategoryFilter,
  TitleWithCount,
} from "@/components";
import { getCachedCategoriesWithSlug } from "@/lib/cached-queries";
import { parseBrandIds, parsePage, parseSortParam } from "@/lib/page-params";
import { supabase } from "@/lib/supabase";
import { getBrandsForSubcategory, getSubcategoryProducts } from "@/services/product.service";

const PAGE_SIZE = 20;

export default async function SubcategoryPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string; subSlug: string }>;
  searchParams: Promise<{ page?: string; brand?: string | string[]; sort?: string }>;
}) {
  const [{ slug, subSlug }, sp] = await Promise.all([params, searchParams]);
  const currentPage = parsePage(sp.page);
  const selectedBrandIds = parseBrandIds(sp.brand);
  const validSort = parseSortParam(sp.sort);

  const allCategories = await getCachedCategoriesWithSlug();

  const parentCategory = allCategories?.find((c) => c.slug === slug && c.parent_id === null);
  if (!parentCategory) notFound();

  const subcategory = allCategories?.find((c) => c.slug === subSlug && c.parent_id === parentCategory.id);
  if (!subcategory) notFound();

  const [brands, { products, total }] = await Promise.all([
    getBrandsForSubcategory(supabase, subcategory.id),
    getSubcategoryProducts(supabase, subcategory.id, {
      page: currentPage,
      sort: validSort,
      brandIds: selectedBrandIds,
      pageSize: PAGE_SIZE,
    }),
  ]);

  if (!total && currentPage === 1 && selectedBrandIds.length === 0) notFound();

  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <>
      <MobileHeader title={parentCategory.name} />

      <MainContainer>
        <TitleWithCount className="hidden md:flex" count={total}>
          {subcategory.name}
        </TitleWithCount>

        <SubcategoryFilter
          subcategories={allCategories.filter((c) => c.parent_id === parentCategory.id)}
          categorySlug={slug}
          activeSubSlug={subSlug}
        />

        <div className="flex flex-wrap items-end gap-4 mb-6">
          <ManufacturerFilter manufacturers={brands} />
          <div className="ml-auto">
            <SortSelect current={validSort} />
          </div>
        </div>

        <h2 className="md:hidden text-lg font-semibold text-center mb-4">{subcategory.name}</h2>

        {products.length === 0 ? (
          <p className="text-gray-500 py-8 text-center">По выбранным фильтрам ничего не найдено</p>
        ) : (
          <>
            <ProductGrid>
              {products.map((product, i) => (
                <ProductCard key={product.id} product={product} priority={i === 0} />
              ))}
            </ProductGrid>

            <Pagination
              page={currentPage}
              totalPages={totalPages}
              basePath={`/catalog/${slug}/${subSlug}`}
              query={{
                ...(selectedBrandIds.length > 0 ? { brand: selectedBrandIds.map(String) } : {}),
                ...(validSort !== "name" ? { sort: validSort } : {}),
              }}
            />
          </>
        )}
      </MainContainer>
    </>
  );
}
