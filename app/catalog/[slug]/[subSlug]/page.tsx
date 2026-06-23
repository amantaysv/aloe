import { notFound } from "next/navigation";
import type { ProductRow } from "@/types";
import { withBrandName } from "@/types";
import Breadcrumb from "@/components/Breadcrumb";
import ManufacturerFilter from "@/components/ManufacturerFilter";
import Pagination from "@/components/Pagination";
import ProductCard from "@/components/ProductCard";
import SortSelect, { type SortValue } from "@/components/SortSelect";
import { supabase } from "@/lib/supabase";

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

  const from = (currentPage - 1) * PAGE_SIZE;

  const { data: allCategories } = await supabase.from("categories").select("id, name, parent_id, slug");

  const parentCategory = allCategories?.find((c) => c.slug === slug && c.parent_id === null);
  if (!parentCategory) notFound();

  const subcategory = allCategories?.find((c) => c.slug === subSlug && c.parent_id === parentCategory.id);
  if (!subcategory) notFound();

  // Fetch distinct brand_ids used in this subcategory, then get brand names
  const { data: brandIdRows } = await supabase
    .from("products")
    .select("brand_id")
    .eq("published", true)
    .eq("category_id", subcategory.id)
    .not("brand_id", "is", null);

  const distinctBrandIds = [...new Set((brandIdRows ?? []).map((r) => r.brand_id as number))];

  const { data: brandsData } = distinctBrandIds.length
    ? await supabase.from("brands").select("id, name").in("id", distinctBrandIds).order("name")
    : { data: [] };

  const brands = brandsData ?? [];

  // Build product query
  let baseQuery = supabase
    .from("products")
    .select("*, brands(name)", { count: "exact" })
    .eq("published", true)
    .eq("category_id", subcategory.id);

  if (selectedBrandIds.length > 0) {
    baseQuery = baseQuery.in("brand_id", selectedBrandIds);
  }

  const sortedQuery =
    validSort === "price_asc"
      ? baseQuery.order("price", { ascending: true })
      : validSort === "price_desc"
        ? baseQuery.order("price", { ascending: false })
        : baseQuery.order("name");

  const { data: rawData, count } = await sortedQuery.range(from, from + PAGE_SIZE - 1);
  const data = withBrandName((rawData ?? []) as unknown as ProductRow[]);

  if (!count && currentPage === 1 && selectedBrandIds.length === 0) notFound();

  const totalPages = Math.ceil((count ?? 0) / PAGE_SIZE);

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
        <span className="text-sm text-gray-400">{count ?? 0} товаров</span>
      </div>

      <div className="flex flex-wrap items-start gap-4 mb-6">
        <ManufacturerFilter manufacturers={brands} className="" />
        <div className="ml-auto">
          <SortSelect current={validSort} />
        </div>
      </div>

      {(data ?? []).length === 0 ? (
        <p className="text-gray-500 py-8 text-center">По выбранным фильтрам ничего не найдено</p>
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {(data ?? []).map((product, i) => (
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
