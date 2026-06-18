import AddToCart from "@/components/AddToCart";
import FavoriteButton from "@/components/FavoriteButton";
import { supabase } from "@/lib/supabase";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

async function getProducts(id: string) {
  const { data } = await supabase.from("products").select("*").eq("category_id", id).order("name");
  return data || [];
}

export default async function CategoryPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const products = await getProducts(id);

  if (!products.length) notFound();

  const categoryName = products[0].category;

  return (
    <main className="max-w-6xl mx-auto px-4 py-8">
      <Link href="/" className="text-sm text-gray-500 hover:text-gray-800 mb-4 inline-block">
        ← Все категории
      </Link>
      <h1 className="text-2xl font-bold mb-6">{categoryName}</h1>
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
            <AddToCart product={{ id: p.id, name: p.name, price: p.price, image_url: p.image_url }} />
          </div>
        ))}
      </div>
    </main>
  );
}
