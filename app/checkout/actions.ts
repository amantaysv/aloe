"use server";

import { updateTag } from "next/cache";
import { after } from "next/server";
import { DELIVERY_OPTIONS, getDeliveryCost } from "@/lib/constants";
import { generateInvoicePdf } from "@/lib/invoice";
import { sendNewOrderEmail } from "@/lib/mailer";
import { createAdminClient } from "@/lib/supabase-admin";
import { createClient } from "@/lib/supabase-server";
import { insertOrder } from "@/services/order.service";
import type { OrderItem } from "@/types";

/** What the browser is allowed to send: ids and quantities only — never prices. */
type OrderLine = { id: number; quantity: number };

const MAX_LINES = 100;
const MAX_QUANTITY = 999;

const LIMITS = { name: 120, phone: 32, address: 500, comment: 1000 } as const;

type Failure = { ok: false; error: string };

function fail(error: string): Failure {
  return { ok: false, error };
}

function normalizeText(value: unknown, max: number): string {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

function parseLines(items: unknown): OrderLine[] | null {
  if (!Array.isArray(items) || items.length === 0 || items.length > MAX_LINES) return null;

  const byId = new Map<number, number>();
  for (const raw of items) {
    const id = Number((raw as OrderLine)?.id);
    const quantity = Number((raw as OrderLine)?.quantity);
    if (!Number.isInteger(id) || id <= 0) return null;
    if (!Number.isInteger(quantity) || quantity <= 0 || quantity > MAX_QUANTITY) return null;
    // Same product sent twice — merge rather than reject.
    byId.set(id, Math.min(MAX_QUANTITY, (byId.get(id) ?? 0) + quantity));
  }
  return [...byId].map(([id, quantity]) => ({ id, quantity }));
}

export async function createOrder({
  name,
  phone,
  address,
  comment,
  items,
  deliveryType,
}: {
  name: string;
  phone: string;
  address: string;
  comment: string;
  items: OrderLine[];
  deliveryType: string;
}): Promise<{ ok: true; orderId: string } | Failure> {
  if (!DELIVERY_OPTIONS.some((o) => o.id === deliveryType)) {
    return fail("Выберите способ доставки.");
  }

  const customerName = normalizeText(name, LIMITS.name);
  const customerPhone = normalizeText(phone, LIMITS.phone);
  const customerAddress = normalizeText(address, LIMITS.address);
  const customerComment = normalizeText(comment, LIMITS.comment);

  if (!customerName || !customerPhone || !customerAddress) {
    return fail("Заполните имя, телефон и адрес доставки.");
  }
  if (customerPhone.replace(/\D/g, "").length < 9) {
    return fail("Укажите корректный номер телефона.");
  }

  const lines = parseLines(items);
  if (!lines) return fail("Корзина повреждена. Обновите страницу и попробуйте ещё раз.");

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Service role bypasses RLS so guest (unauthenticated) orders are allowed.
  const admin = createAdminClient();

  // Prices are re-read from the database — anything the client sent about money is ignored.
  const { data: products, error: productsError } = await admin
    .from("products")
    .select("id, name, price, image_url")
    .in(
      "id",
      lines.map((l) => l.id),
    )
    .eq("published", true);

  if (productsError) return fail("Не удалось проверить товары. Попробуйте ещё раз.");

  const priced = new Map((products ?? []).map((p) => [Number(p.id), p]));
  const missing = lines.filter((l) => !priced.has(l.id));
  if (missing.length > 0) {
    return fail("Часть товаров больше не доступна. Обновите корзину и попробуйте ещё раз.");
  }

  const orderItems: OrderItem[] = lines.map((line) => {
    const product = priced.get(line.id)!;
    return {
      id: Number(product.id),
      name: String(product.name),
      price: Number(product.price),
      quantity: line.quantity,
      image_url: String(product.image_url),
    };
  });

  const itemsTotal = orderItems.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const deliveryCost = getDeliveryCost(deliveryType, itemsTotal);
  const total = itemsTotal + deliveryCost;

  const { data, error } = await insertOrder(admin, {
    userId: user?.id,
    name: customerName,
    phone: customerPhone,
    address: customerAddress,
    comment: customerComment,
    items: orderItems,
    total,
    deliveryType,
    deliveryCost,
  });

  if (error || !data) return fail("Не удалось оформить заказ. Попробуйте ещё раз.");

  if (user?.id) {
    await admin.from("cart_items").delete().eq("user_id", user.id);
  }

  const { error: rpcError } = await admin.rpc("increment_product_purchase_counts", {
    items: orderItems.map((i) => ({ id: i.id, qty: i.quantity })),
  });
  if (rpcError) console.error("[checkout] purchase count RPC failed:", rpcError.message);

  updateTag("products");

  const orderId = String(data.id);
  const deliveryLabel = DELIVERY_OPTIONS.find((o) => o.id === deliveryType)!.label;

  // The invoice and the admin email must never block the confirmation — or fail it. The order
  // is already committed at this point, so an SMTP outage or a missing font would otherwise
  // surface to the customer as a failed checkout and get retried into a duplicate order.
  after(async () => {
    try {
      const invoicePdf = await generateInvoicePdf({
        orderId,
        createdAt: new Date(),
        name: customerName,
        phone: customerPhone,
        address: customerAddress,
        comment: customerComment,
        deliveryLabel,
        deliveryCost,
        items: orderItems,
        itemsTotal,
        total,
      });
      await sendNewOrderEmail(
        {
          orderId,
          name: customerName,
          phone: customerPhone,
          address: customerAddress,
          comment: customerComment,
          items: orderItems,
          itemsTotal,
          deliveryLabel,
          deliveryCost,
          total,
        },
        invoicePdf,
      );
    } catch (err) {
      console.error(`[checkout] post-order notification failed for order ${orderId}`, err);
    }
  });

  return { ok: true as const, orderId };
}
