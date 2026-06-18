"use server";
import { createClient } from "@/lib/supabase-server";

type CartItem = { id: number; name: string; price: number; quantity: number; image_url: string };

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

  const { data, error } = await supabase
    .from("orders")
    .insert({
      user_id: user?.id,
      items,
      total,
      customer_name: name,
      customer_phone: phone,
      customer_address: address,
      comment: comment || null,
      status: "new",
    })
    .select("id")
    .single();

  if (error) throw new Error(error.message);

  return { orderId: String(data.id) };
}
