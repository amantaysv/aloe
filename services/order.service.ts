import type { SupabaseClient } from "@supabase/supabase-js";

type CartItem = {
  id: number;
  name: string;
  price: number;
  quantity: number;
  image_url: string;
};

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

  let query = supabase
    .from("orders")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false });
  if (q) query = query.or(`customer_name.ilike.%${q}%,customer_phone.ilike.%${q}%`);
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
    items: CartItem[];
    total: number;
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
    })
    .select("id")
    .single();
}
