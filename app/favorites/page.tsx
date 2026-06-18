import { redirect } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { createClient } from "@/lib/supabase-server";
import AddToCart from "@/components/AddToCart";
import FavoriteButton from "@/components/FavoriteButton";

type Product = {
  id: number;
  name: string;
  price: number;
  image_url: string;
  category: string;
  category_id: string;
};

export default async function FavoritesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/auth");

  const { data } = await supabase
    .from("favorites")
    .select("product_id, products(*)")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  const products = (data || []).map((f) => f.products as unknown as Product | null).filter(Boolean) as Product[];

  return (
    <main className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Избранное</h1>

      {products.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <p className="text-5xl mb-4">♡</p>
          <p className="text-lg font-medium text-gray-600">Здесь пока пусто</p>
          <p className="text-sm mt-1 mb-6">Добавляйте товары в избранное, нажимая на сердечко</p>
          <Link href="/" className="text-green-600 hover:underline text-sm">
            Перейти в каталог
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {products.map((p) => (
            <div key={p.id} className="border rounded-lg overflow-hidden hover:shadow-md transition-shadow">
              <div className="relative aspect-square bg-gray-50">
                <Image src={p.image_url} alt={p.name} fill className="object-contain p-2" unoptimized />
                <FavoriteButton productId={p.id} />
              </div>
              <div className="p-3">
                <p className="text-xs text-gray-400 mb-1">{p.category}</p>
                <p className="text-sm font-medium line-clamp-2">{p.name}</p>
                <p className="text-base font-bold mt-1">{p.price} сом</p>
              </div>
              <div className="px-3 pb-3">
                <AddToCart product={{ id: p.id, name: p.name, price: p.price, image_url: p.image_url }} />
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
