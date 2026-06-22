import { createClient } from "@/lib/supabase-server";
import AdminOrders from "../AdminOrders";

const PAGE_SIZE = 15;

export default async function OrdersPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const supabase = await createClient();
  const sp = await searchParams;

  const currentPage = Math.max(1, parseInt(sp.page ?? "1") || 1);
  const q = sp.q ?? "";
  const statuses = sp.status ? sp.status.split(",") : [];
  const from = (currentPage - 1) * PAGE_SIZE;

  let oq = supabase.from("orders").select("*", { count: "exact" }).order("created_at", { ascending: false });
  if (q) oq = oq.or(`customer_name.ilike.%${q}%,customer_phone.ilike.%${q}%`);
  if (statuses.length > 0) oq = oq.in("status", statuses);
  oq = oq.range(from, from + PAGE_SIZE - 1);

  const [{ data: orders, count }, { data: allStatusRows }] = await Promise.all([
    oq,
    supabase.from("orders").select("status"),
  ]);

  const statusCounts: Record<string, number> = {};
  for (const row of allStatusRows ?? []) {
    statusCounts[row.status] = (statusCounts[row.status] ?? 0) + 1;
  }

  return (
    <AdminOrders
      orders={(orders ?? []) as Parameters<typeof AdminOrders>[0]["orders"]}
      page={currentPage}
      totalPages={Math.ceil((count ?? 0) / PAGE_SIZE)}
      total={count ?? 0}
      q={q}
      statusFilter={sp.status ?? ""}
      statusCounts={statusCounts}
    />
  );
}
