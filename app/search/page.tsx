import { supabase } from "@/lib/supabase";
import FavoriteButton from "@/components/FavoriteButton";
import Pagination from "@/components/Pagination";
import Image from "next/image";
import Link from "next/link";

const PAGE_SIZE = 24;

async function searchProducts(query: string, page: number) {
  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  const { data, count } = await supabase.from("products").select("*", { count: "exact" }).ilike("name", `%${query}%`).order("name").range(from, to);

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
            {products.map((p) => (
              <div key={p.id} className="border rounded-lg overflow-hidden hover:shadow-md transition-shadow">
                <div className="relative aspect-square bg-gray-50">
                  <Image src={p.image_url} alt={p.name} fill className="object-contain p-2" unoptimized />
                  <FavoriteButton productId={p.id} />
                </div>
                <div className="p-3">
                  <p className="text-sm font-medium line-clamp-2">{p.name}</p>
                  <p className="text-base font-bold mt-1">{p.price} сом</p>
                </div>
              </div>
            ))}
          </div>

          <Pagination page={currentPage} totalPages={totalPages} basePath="/search" query={{ q }} />
        </>
      )}
    </main>
  );
}
