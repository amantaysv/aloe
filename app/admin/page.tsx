import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase-server";
import AdminShell from "./AdminShell";

export const metadata = { title: "Админ" };

export default async function AdminPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || user.app_metadata?.role !== "admin") notFound();

  const [{ data: orders }, { data: products }, { data: categories }, { data: banners }] = await Promise.all([
    supabase.from("orders").select("*").order("created_at", { ascending: false }),
    supabase.from("products").select("*").order("id", { ascending: false }),
    supabase.from("categories").select("*").order("name"),
    supabase.from("banners").select("*").order("sort_order"),
  ]);

  return (
    <main className="max-w-5xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Админ</h1>
      <AdminShell
        orders={(orders ?? []) as Parameters<typeof AdminShell>[0]["orders"]}
        products={products ?? []}
        categories={categories ?? []}
        banners={banners ?? []}
      />
    </main>
  );
}
