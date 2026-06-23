import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Breadcrumb from "@/components/Breadcrumb";
import Pagination from "@/components/Pagination";
import ProductCard from "@/components/ProductCard";
import { createClient } from "@/lib/supabase-server";

const PAGE_SIZE = 24;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ brand: string }>;
}): Promise<Metadata> {
  const { brand } = await params;
  const supabase = await createClient();
  const { data } = await supabase.from("brands").select("name").eq("slug", brand).single();
  if (!data) return {};
  return { title: `${data.name} — Бренды — Aloe.kg` };
}

export default async function BrandPage({
  params,
  searchParams,
}: {
  params: Promise<{ brand: string }>;
  searchParams: Promise<{ page?: string }>;
}) {
  const [{ brand }, { page = "1" }] = await Promise.all([params, searchParams]);
  const currentPage = Math.max(1, parseInt(page));
  const from = (currentPage - 1) * PAGE_SIZE;

  const supabase = await createClient();

  const { data: brandData } = await supabase
    .from("brands")
    .select("id, name, slug")
    .eq("slug", brand)
    .single();

  if (!brandData) notFound();

  const { data: rawData, count } = await supabase
    .from("products")
    .select("*", { count: "exact" })
    .eq("published", true)
    .eq("brand_id", brandData.id)
    .order("name")
    .range(from, from + PAGE_SIZE - 1);

  if (!count && currentPage === 1) notFound();

  const data = (rawData ?? []).map((p) => ({ ...p, brand_name: brandData.name }));

  const totalPages = Math.ceil((count ?? 0) / PAGE_SIZE);

  return (
    <main className="max-w-6xl mx-auto px-4 py-8">
      <Breadcrumb
        crumbs={[
          { label: "Главная", href: "/" },
          { label: "Бренды", href: "/brands" },
          { label: brandData.name },
        ]}
      />

      <div className="flex items-baseline gap-3 mb-6">
        <h1 className="text-2xl font-bold">{brandData.name}</h1>
        <span className="text-sm text-gray-400">{count} товаров</span>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {(data ?? []).map((product, i) => (
          <ProductCard key={product.id} product={product} priority={i === 0} />
        ))}
      </div>

      <Pagination page={currentPage} totalPages={totalPages} basePath={`/brands/${brand}`} />
    </main>
  );
}
