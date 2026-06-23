import { createClient } from "@/lib/supabase-server";
import AdminProducts from "../AdminProducts";

const PAGE_SIZE = 20;

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const supabase = await createClient();
  const sp = await searchParams;

  const currentPage = Math.max(1, parseInt(sp.page ?? "1") || 1);
  const q = sp.q ?? "";
  const label = sp.label ?? "";
  const published = sp.published ?? "";
  const sort = (sp.sort ?? "id-desc") as "id-desc" | "name-asc" | "price-asc" | "price-desc";
  const from = (currentPage - 1) * PAGE_SIZE;

  let pq = supabase.from("products").select("*", { count: "exact" });
  if (q) pq = pq.or(`name.ilike.%${q}%,category.ilike.%${q}%`);
  if (label === "none") pq = pq.is("label", null);
  else if (label) pq = pq.eq("label", label);
  if (published === "yes") pq = pq.eq("published", true);
  else if (published === "no") pq = pq.eq("published", false);
  if (sort === "name-asc") pq = pq.order("name");
  else if (sort === "price-asc") pq = pq.order("price", { ascending: true });
  else if (sort === "price-desc") pq = pq.order("price", { ascending: false });
  else pq = pq.order("created_at", { ascending: false }).order("id", { ascending: false });
  pq = pq.range(from, from + PAGE_SIZE - 1);

  const [{ data: products, count }, { data: categories }] = await Promise.all([
    pq,
    supabase.from("categories").select("*").order("name"),
  ]);

  const totalPages = Math.ceil((count ?? 0) / PAGE_SIZE);

  return (
    <AdminProducts
      products={(products ?? []) as Parameters<typeof AdminProducts>[0]["products"]}
      page={currentPage}
      totalPages={totalPages}
      total={count ?? 0}
      q={q}
      label={label}
      published={published}
      sort={sort}
      categories={(categories ?? []) as Parameters<typeof AdminProducts>[0]["categories"]}
    />
  );
}
