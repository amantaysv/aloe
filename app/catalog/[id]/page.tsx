import AddToCart from "@/components/AddToCart";
import FavoriteButton from "@/components/FavoriteButton";
import Pagination from "@/components/Pagination";
import { supabase } from "@/lib/supabase";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

const PAGE_SIZE = 20;

export default async function CategoryPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ page?: string }> }) {
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
        {(data || []).map((p) => (
          <div key={p.id} className="border rounded-lg overflow-hidden hover:shadow-md transition-shadow">
            <div className="relative aspect-square bg-gray-50">
              <Image src={p.image_url} alt={p.name} fill className="object-contain p-2" unoptimized />
              <FavoriteButton productId={p.id} />
            </div>
            <div className="p-3">
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
      <Pagination page={currentPage} totalPages={totalPages} basePath={`/catalog/${id}`} />
    </main>
  );
}
