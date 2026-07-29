"use server";

import { createClient as createSupabase } from "@supabase/supabase-js";
import { updateTag } from "next/cache";
import { DELIVERY_OPTIONS, getDeliveryCost } from "@/lib/constants";
import { generateInvoicePdf } from "@/lib/invoice";
import { sendNewOrderEmail } from "@/lib/mailer";
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
  deliveryType,
}: {
  name: string;
  phone: string;
  address: string;
  comment: string;
  items: CartItem[];
  total: number;
  deliveryType: string;
}) {
  if (!DELIVERY_OPTIONS.some((o) => o.id === deliveryType)) {
    return { ok: false as const, error: "Выберите способ доставки." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Use service role to bypass RLS so guest (unauthenticated) orders are allowed
  const admin = createSupabase(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

  const deliveryCost = getDeliveryCost(deliveryType, total);
  const { data, error } = await insertOrder(admin, {
    userId: user?.id,
    name,
    phone,
    address,
    comment,
    items,
    total: total + deliveryCost,
    deliveryType,
    deliveryCost,
  });

  if (error) return { ok: false as const, error: "Не удалось оформить заказ. Попробуйте ещё раз." };

  if (user?.id) {
    await admin.from("cart_items").delete().eq("user_id", user.id);
  }

  await admin.rpc("increment_product_purchase_counts", {
    items: items.map((i) => ({ id: i.id, qty: i.quantity })),
  });
  updateTag("products");

  const orderId = String(data!.id);
  const deliveryLabel = DELIVERY_OPTIONS.find((o) => o.id === deliveryType)!.label;
  const invoicePdf = await generateInvoicePdf({
    orderId,
    createdAt: new Date(),
    name,
    phone,
    address,
    comment,
    deliveryLabel,
    deliveryCost,
    items,
    itemsTotal: total,
    total: total + deliveryCost,
  });
  await sendNewOrderEmail(
    {
      orderId,
      name,
      phone,
      address,
      comment,
      items,
      itemsTotal: total,
      deliveryLabel,
      deliveryCost,
      total: total + deliveryCost,
    },
    invoicePdf,
  );

  return { ok: true as const, orderId };
}
