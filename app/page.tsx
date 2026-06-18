import { supabase } from "@/lib/supabase";
import Link from "next/link";

async function getCategories() {
  const { data } = await supabase.from("products").select("category, category_id");

  const map = new Map<string, { name: string; id: string; count: number }>();
  data?.forEach((p) => {
    if (!map.has(p.category_id)) {
      map.set(p.category_id, { name: p.category, id: p.category_id, count: 0 });
    }
    map.get(p.category_id)!.count++;
  });

  return Array.from(map.values()).sort((a, b) => b.count - a.count);
}

export default async function HomePage() {
  const categories = await getCategories();

  return (
    <main className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Каталог товаров</h1>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {categories.map((cat) => (
          <Link key={cat.id} href={`/catalog/${cat.id}`} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
            <p className="font-medium">{cat.name}</p>
            <p className="text-sm text-gray-500 mt-1">{cat.count} товаров</p>
          </Link>
        ))}
      </div>
    </main>
  );
}
