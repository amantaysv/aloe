import type { SupabaseClient } from "@supabase/supabase-js";
import type { OrderItem } from "@/types";

/**
 * `.or()` takes a raw PostgREST filter expression, so anything interpolated into it can
 * rewrite the filter tree. Strip the characters that carry meaning there.
 */
function escapeOrFilterValue(value: string): string {
  return value.replace(/[,().:*"\\]/g, " ").trim();
}

export async function getUserOrders(supabase: SupabaseClient, userId: string) {
  const { data } = await supabase
    .from("orders")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  return data ?? [];
}

export async function getAdminOrders(
  supabase: SupabaseClient,
  options: { q?: string; statuses?: string[]; page?: number; pageSize?: number },
) {
  const { q = "", statuses = [], page = 1, pageSize = 15 } = options;
  const from = (page - 1) * pageSize;

  let query = supabase.from("orders").select("*", { count: "exact" }).order("created_at", { ascending: false });
  const safeQ = escapeOrFilterValue(q);
  if (safeQ) query = query.or(`customer_name.ilike.%${safeQ}%,customer_phone.ilike.%${safeQ}%`);
  if (statuses.length > 0) query = query.in("status", statuses);

  const { data, count } = await query.range(from, from + pageSize - 1);
  return { orders: data ?? [], total: count ?? 0 };
}

export async function getOrderStatusCounts(supabase: SupabaseClient) {
  const { data } = await supabase.from("orders").select("status");
  const counts: Record<string, number> = {};
  for (const row of data ?? []) {
    counts[row.status] = (counts[row.status] ?? 0) + 1;
  }
  return counts;
}

export async function insertOrder(
  supabase: SupabaseClient,
  data: {
    userId?: string;
    name: string;
    phone: string;
    address: string;
    comment: string;
    items: OrderItem[];
    total: number;
    deliveryType: string;
    deliveryCost: number;
  },
) {
  return supabase
    .from("orders")
    .insert({
      user_id: data.userId,
      items: data.items,
      total: data.total,
      customer_name: data.name,
      customer_phone: data.phone,
      customer_address: data.address,
      comment: data.comment || null,
      status: "new",
      delivery_type: data.deliveryType,
      delivery_cost: data.deliveryCost,
    })
    .select("id")
    .single();
}
