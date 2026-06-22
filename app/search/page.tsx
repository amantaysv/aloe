import Link from "next/link";
import Pagination from "@/components/Pagination";
import ProductCard from "@/components/ProductCard";
import { supabase } from "@/lib/supabase";

const PAGE_SIZE = 24;

async function searchProducts(query: string, page: number) {
  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  const { data, count } = await supabase
    .from("products")
    .select("*", { count: "exact" })
    .ilike("name", `%${query}%`)
    .order("name")
    .range(from, to);

  return { products: data || [], total: count || 0 };
}

export default async function SearchPage({ searchParams }: { searchParams: Promise<{ q?: string; page?: string }> }) {
  const { q = "", page = "1" } = await searchParams;
  const currentPage = parseInt(page);
  const { products, total } = await searchProducts(q, currentPage);
  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <main>
      <div className="mb-6">
        <h1 className="text-xl font-bold">
          Результаты поиска: <span className="text-green-600">«{q}»</span>
        </h1>
        <p className="text-sm text-gray-500 mt-1">Найдено: {total} товаров</p>
      </div>

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
          <Pagination page={currentPage} totalPages={totalPages} basePath="/search" query={{ q }} />
        </>
      )}
    </main>
  );
}
