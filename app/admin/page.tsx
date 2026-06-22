import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase-server";
import AdminShell from "./AdminShell";

export const metadata = { title: "Админ" };

const PAGE_SIZE = 20;

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user || user.app_metadata?.role !== "admin") notFound();

  const sp = await searchParams;
  const currentPage = Math.max(1, parseInt(sp.page ?? "1") || 1);
  const q = sp.q ?? "";
  const label = sp.label ?? "";
  const sort = (sp.sort ?? "id-desc") as "id-desc" | "name-asc" | "price-asc" | "price-desc";
  const from = (currentPage - 1) * PAGE_SIZE;

  let pq = supabase.from("products").select("*", { count: "exact" });
  if (q) pq = pq.or(`name.ilike.%${q}%,category.ilike.%${q}%`);
  if (label === "none") pq = pq.is("label", null);
  else if (label) pq = pq.eq("label", label);
  if (sort === "name-asc") pq = pq.order("name");
  else if (sort === "price-asc") pq = pq.order("price", { ascending: true });
  else if (sort === "price-desc") pq = pq.order("price", { ascending: false });
  else pq = pq.order("id", { ascending: false });
  pq = pq.range(from, from + PAGE_SIZE - 1);

  const [
    { data: orders },
    { data: products, count: productsCount },
    { data: allCatIds },
    { data: allMfr },
    { data: categories },
    { data: banners },
  ] = await Promise.all([
    supabase.from("orders").select("*").order("created_at", { ascending: false }),
    pq,
    supabase.from("products").select("category_id"),
    supabase.from("products").select("manufacturer").not("manufacturer", "is", null),
    supabase.from("categories").select("*").order("name"),
    supabase.from("banners").select("*").order("sort_order"),
  ]);

  const totalPages = Math.ceil((productsCount ?? 0) / PAGE_SIZE);
  const usedCategoryIds = [...new Set((allCatIds ?? []).map((p) => p.category_id as string))];
  const manufacturers = [
    ...new Set((allMfr ?? []).map((p) => p.manufacturer as string)),
  ].sort((a, b) => a.localeCompare(b, "ru"));

  return (
    <main className="max-w-5xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Админ</h1>
      <AdminShell
        orders={(orders ?? []) as Parameters<typeof AdminShell>[0]["orders"]}
        products={products ?? []}
        productsPage={currentPage}
        productsTotalPages={totalPages}
        productsTotal={productsCount ?? 0}
        productsQ={q}
        productsLabel={label}
        productsSort={sort}
        categories={categories ?? []}
        manufacturers={manufacturers}
        usedCategoryIds={usedCategoryIds}
        banners={banners ?? []}
      />
    </main>
  );
}
