import Link from "next/link";
import type { ProductRow } from "@/types";
import { withBrandName } from "@/types";
import ManufacturerFilter from "@/components/ManufacturerFilter";
import Pagination from "@/components/Pagination";
import ProductCard from "@/components/ProductCard";
import { supabase } from "@/lib/supabase";

const PAGE_SIZE = 24;

async function searchProducts(query: string, brandIds: number[], page: number) {
  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  let q = supabase
    .from("products")
    .select("*, brands(name)", { count: "exact" })
    .ilike("name", `%${query}%`)
    .order("name")
    .range(from, to);

  if (brandIds.length > 0) {
    q = q.in("brand_id", brandIds);
  }

  const { data, count } = await q;
  return { products: withBrandName((data ?? []) as unknown as ProductRow[]), total: count || 0 };
}

async function getBrandsForQuery(query: string) {
  // Brands whose products match the search query
  const { data: productRows } = await supabase
    .from("products")
    .select("brand_id")
    .ilike("name", `%${query}%`)
    .not("brand_id", "is", null);

  const ids = [...new Set((productRows ?? []).map((r) => r.brand_id as number))];
  if (!ids.length) return [];

  const { data } = await supabase.from("brands").select("id, name").in("id", ids).order("name");
  return data ?? [];
}

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string; brand?: string | string[] }>;
}) {
  const sp = await searchParams;
  const q = sp.q ?? "";
  const currentPage = Math.max(1, parseInt(sp.page ?? "1"));
  const selectedBrandIds = (sp.brand ? (Array.isArray(sp.brand) ? sp.brand : [sp.brand]) : []).map(Number);

  const [{ products, total }, brands] = await Promise.all([
    searchProducts(q, selectedBrandIds, currentPage),
    getBrandsForQuery(q),
  ]);

  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <main>
      <div className="mb-6">
        <h1 className="text-xl font-bold">
          Результаты поиска: <span className="text-green-600">«{q}»</span>
        </h1>
        <p className="text-sm text-gray-500 mt-1">Найдено: {total} товаров</p>
      </div>

      <ManufacturerFilter manufacturers={brands} />

      {products.length === 0 ? (
        <div className="text-center py-16 text-gray-500">
          <p className="text-lg">Ничего не найдено</p>
          <Link href="/" className="text-green-600 text-sm mt-2 inline-block hover:underline">
            Вернуться в каталог
          </Link>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {products.map((p, i) => (
              <ProductCard key={p.id} product={p} priority={i === 0} />
            ))}
          </div>
          <Pagination
            page={currentPage}
            totalPages={totalPages}
            basePath="/search"
            query={
              selectedBrandIds.length > 0
                ? { q, brand: selectedBrandIds.map(String) }
                : { q }
            }
          />
        </>
      )}
    </main>
  );
}
