import { notFound } from "next/navigation";
import Breadcrumb from "@/components/Breadcrumb";
import ManufacturerFilter from "@/components/ManufacturerFilter";
import Pagination from "@/components/Pagination";
import ProductCard from "@/components/ProductCard";
import SortSelect, { type SortValue } from "@/components/SortSelect";
import { getCachedCategoriesWithSlug } from "@/lib/cached-queries";
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
  const currentPage = Math.max(1, parseInt(sp.page ?? "1"));
  const selectedBrandIds = (sp.brand ? (Array.isArray(sp.brand) ? sp.brand : [sp.brand]) : []).map(Number);
  const sortParam = (sp.sort ?? "name") as SortValue;
  const validSort: SortValue = ["name", "price_asc", "price_desc"].includes(sortParam) ? sortParam : "name";

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
    <main className="max-w-6xl mx-auto px-4 py-8">
      <Breadcrumb
        crumbs={[
          { label: "Главная", href: "/" },
          { label: parentCategory.name, href: `/catalog/${slug}` },
          { label: subcategory.name },
        ]}
      />

      <div className="flex items-baseline gap-3 mb-4">
        <h1 className="text-2xl font-bold">{subcategory.name}</h1>
        <span className="text-sm text-gray-400">{total} товаров</span>
      </div>

      <div className="flex flex-wrap items-start gap-4 mb-6">
        <ManufacturerFilter manufacturers={brands} className="" />
        <div className="ml-auto">
          <SortSelect current={validSort} />
        </div>
      </div>

      {products.length === 0 ? (
        <p className="text-gray-500 py-8 text-center">По выбранным фильтрам ничего не найдено</p>
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {products.map((product, i) => (
              <ProductCard key={product.id} product={product} priority={i === 0} />
            ))}
          </div>

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
    </main>
  );
}
