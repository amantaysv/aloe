"use server";

import { createClient as createSupabase } from "@supabase/supabase-js";
import { updateTag } from "next/cache";
import { createClient } from "@/lib/supabase-server";
import { insertOrder } from "@/services/order.service";

type CartItem = {
  id: number;
  name: string;
  price: number;
  quantity: number;
  image_url: string;
};

export async function createOrder({
  name,
  phone,
  address,
  comment,
  items,
  total,
}: {
  name: string;
  phone: string;
  address: string;
  comment: string;
  items: CartItem[];
  total: number;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Use service role to bypass RLS so guest (unauthenticated) orders are allowed
  const admin = createSupabase(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

  const { data, error } = await insertOrder(admin, { userId: user?.id, name, phone, address, comment, items, total });

  if (error) return { ok: false as const, error: "Не удалось оформить заказ. Попробуйте ещё раз." };

  if (user?.id) {
    await admin.from("cart_items").delete().eq("user_id", user.id);
  }

  await admin.rpc("increment_product_purchase_counts", {
    items: items.map((i) => ({ id: i.id, qty: i.quantity })),
  });
  updateTag("products");

  return { ok: true as const, orderId: String(data!.id) };
}
