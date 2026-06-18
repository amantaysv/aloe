import { supabase } from "@/lib/supabase";
import Image from "next/image";
import Link from "next/link";
import AddToCart from "@/components/AddToCart";
import FavoriteButton from "@/components/FavoriteButton";
import Pagination from "@/components/Pagination";
import type { Product } from "@/types";

export const metadata = { title: "Скидки — Aloe.kg" };

const PAGE_SIZE = 20;

export default async function DiscountPage({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
  const { page = "1" } = await searchParams;
  const currentPage = Math.max(1, parseInt(page));
  const from = (currentPage - 1) * PAGE_SIZE;

  const { data, count } = await supabase
    .from("products")
    .select("*", { count: "exact" })
    .eq("is_discount", true)
    .order("name")
    .range(from, from + PAGE_SIZE - 1);

  const products: Product[] = data || [];
  const totalPages = Math.ceil((count || 0) / PAGE_SIZE);

  return (
    <main className="max-w-6xl mx-auto px-4 py-8">
      <Link href="/" className="text-sm text-gray-500 hover:text-gray-800 mb-4 inline-block">← Главная</Link>
      <div className="flex items-baseline gap-3 mb-6">
        <h1 className="text-2xl font-bold">Скидки</h1>
        {count ? <span className="text-sm text-gray-400">{count} товаров</span> : null}
      </div>
      {products.length === 0 ? (
        <p className="text-gray-400 text-sm">Товары не добавлены</p>
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {products.map((p) => (
              <div key={p.id} className="border rounded-lg overflow-hidden hover:shadow-md transition-shadow">
                <div className="relative aspect-square bg-gray-50">
                  <Image src={p.image_url} alt={p.name} fill className="object-contain p-2" unoptimized />
                  <div className="absolute top-1.5 left-1.5">
                    <span className="bg-red-500 text-white text-[10px] font-semibold px-1.5 py-0.5 rounded">Скидка</span>
                  </div>
                  <FavoriteButton productId={p.id} />
                </div>
                <div className="p-3">
                  <p className="text-xs text-gray-400 mb-1">{p.category}</p>
                  <p className="text-sm font-medium line-clamp-2">{p.name}</p>
                  <div className="flex items-baseline gap-1.5 mt-1">
                    <p className="text-base font-bold">{p.price} сом</p>
                    {p.old_price && <p className="text-sm text-gray-400 line-through">{p.old_price} сом</p>}
                  </div>
                </div>
                <div className="px-3 pb-3">
                  <AddToCart product={{ id: p.id, name: p.name, price: p.price, image_url: p.image_url }} />
                </div>
              </div>
            ))}
          </div>
          <Pagination page={currentPage} totalPages={totalPages} basePath="/discount" />
        </>
      )}
    </main>
  );
}
