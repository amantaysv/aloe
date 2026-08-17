import { requireAdmin } from "@/lib/auth";
import { getAdminOrders, getOrderStatusCounts } from "@/services/order.service";
import AdminOrders from "../AdminOrders";

const PAGE_SIZE = 15;

export default async function OrdersPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const { db: supabase } = await requireAdmin();
  const sp = await searchParams;

  const currentPage = Math.max(1, parseInt(sp.page ?? "1") || 1);
  const q = sp.q ?? "";
  const statuses = sp.status ? sp.status.split(",") : [];

  const [{ orders, total }, statusCounts] = await Promise.all([
    getAdminOrders(supabase, { q, statuses, page: currentPage, pageSize: PAGE_SIZE }),
    getOrderStatusCounts(supabase),
  ]);

  return (
    <AdminOrders
      orders={orders}
      page={currentPage}
      totalPages={Math.ceil(total / PAGE_SIZE)}
      total={total}
      q={q}
      statusFilter={sp.status ?? ""}
      statusCounts={statusCounts}
    />
  );
}
