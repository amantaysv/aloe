import { notFound } from "next/navigation";
import Breadcrumb from "@/components/Breadcrumb";
import Pagination from "@/components/Pagination";
import ProductCard from "@/components/ProductCard";
import { supabase } from "@/lib/supabase";

const PAGE_SIZE = 20;

export default async function SubcategoryPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string; subSlug: string }>;
  searchParams: Promise<{ page?: string }>;
}) {
  const [{ slug, subSlug }, { page = "1" }] = await Promise.all([params, searchParams]);
  const currentPage = Math.max(1, parseInt(page));
  const from = (currentPage - 1) * PAGE_SIZE;

  const { data: allCategories } = await supabase.from("categories").select("id, name, parent_id, slug");

  const parentCategory = allCategories?.find((c) => c.parent_id === null);
  if (!parentCategory) notFound();

  const subcategory = allCategories?.find((c) => c.slug === subSlug && c.parent_id === parentCategory.id);
  if (!subcategory) notFound();

  const { data, count } = await supabase
    .from("products")
    .select("*", { count: "exact" })
    .eq("category_id", subcategory.id)
    .order("name")
    .range(from, from + PAGE_SIZE - 1);

  if (!count) notFound();

  const totalPages = Math.ceil(count / PAGE_SIZE);

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
        <span className="text-sm text-gray-400">{count} товаров</span>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {(data ?? []).map((product, i) => (
          <ProductCard key={product.id} product={product} priority={i === 0} />
        ))}
      </div>

      <Pagination page={currentPage} totalPages={totalPages} basePath={`/catalog/${slug}/${subSlug}`} />
    </main>
  );
}
