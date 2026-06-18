import Link from "next/link";
import { notFound } from "next/navigation";

import Pagination from "@/components/Pagination";
import ProductCard from "@/components/ProductCard";
import { supabase } from "@/lib/supabase";

const PAGE_SIZE = 20;

export default async function CategoryPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ page?: string }>;
}) {
  const [{ id }, { page = "1" }] = await Promise.all([params, searchParams]);
  const currentPage = Math.max(1, parseInt(page));
  const from = (currentPage - 1) * PAGE_SIZE;

  const { data, count } = await supabase
    .from("products")
    .select("*", { count: "exact" })
    .eq("category_id", id)
    .order("name")
    .range(from, from + PAGE_SIZE - 1);

  if (!count) notFound();

  const categoryName = data?.[0]?.category ?? id;
  const totalPages = Math.ceil(count / PAGE_SIZE);

  return (
    <main className="max-w-6xl mx-auto px-4 py-8">
      <Link href="/" className="text-sm text-gray-500 hover:text-gray-800 mb-4 inline-block">
        ← На главную
      </Link>
      <div className="flex items-baseline gap-3 mb-6">
        <h1 className="text-2xl font-bold">{categoryName}</h1>
        <span className="text-sm text-gray-400">{count} товаров</span>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {(data || []).map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
      <Pagination page={currentPage} totalPages={totalPages} basePath={`/catalog/${id}`} />
    </main>
  );
}
