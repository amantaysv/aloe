"use server";

import { updateTag } from "next/cache";
import { after } from "next/server";
import { DELIVERY_OPTIONS, getDeliveryCost } from "@/lib/constants";
import { generateInvoicePdf } from "@/lib/invoice";
import { sendNewOrderEmail } from "@/lib/mailer";
import { createAdminClient } from "@/lib/supabase-admin";
import { createClient } from "@/lib/supabase-server";
import { insertOrder, markOrderNotified } from "@/services/order.service";
import type { OrderItem } from "@/types";

/** What the browser is allowed to send: ids and quantities only — never prices. */
type OrderLine = { id: number; quantity: number };

const MAX_LINES = 100;
const MAX_QUANTITY = 999;

const LIMITS = { name: 120, phone: 32, address: 500, comment: 1000 } as const;

type Failure = { ok: false; error: string };

/** Line the client asked for that cannot be ordered, with the reason, so the UI can name it. */
export type RejectedLine = { id: number; name: string | null; reason: "missing" | "no-price" };

export type Quote = {
  items: OrderItem[];
  itemsTotal: number;
  deliveryCost: number;
  total: number;
  /** Empty when everything resolved; otherwise the caller should prune these and re-quote. */
  rejected: RejectedLine[];
};

type CreateOrderResult = { ok: true; orderId: string } | (Failure & { rejected?: RejectedLine[]; quote?: Quote });

function fail(error: string): Failure {
  return { ok: false, error };
}

/** Money is `numeric` in Postgres; keep two decimals so float artefacts never reach a customer. */
function money(value: number): number {
  return Math.round(value * 100) / 100;
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

type AdminClient = ReturnType<typeof createAdminClient>;

/**
 * The single place order money is computed. Both `quoteOrder` (what the customer is shown) and
 * `createOrder` (what is persisted) go through it, so the two cannot disagree — which is exactly
 * what happened while the client totalled the cart from its own localStorage prices.
 */
async function buildQuote(admin: AdminClient, lines: OrderLine[], deliveryType: string): Promise<Quote> {
  const { data, error } = await admin
    .from("products")
    .select("id, name, price, image_url")
    .in(
      "id",
      lines.map((l) => l.id),
    )
    .eq("published", true);

  if (error) throw new Error(`[checkout] product lookup failed: ${error.message}`);

  const priced = new Map((data ?? []).map((p) => [Number(p.id), p]));
  const items: OrderItem[] = [];
  const rejected: RejectedLine[] = [];

  for (const line of lines) {
    const product = priced.get(line.id);
    if (!product) {
      rejected.push({ id: line.id, name: null, reason: "missing" });
      continue;
    }
    // price is nullable in the schema; Number(null) is 0, which used to make such a product
    // orderable for free.
    const price = product.price == null ? null : Number(product.price);
    if (price == null || !Number.isFinite(price) || price <= 0) {
      rejected.push({ id: line.id, name: product.name, reason: "no-price" });
      continue;
    }
    items.push({
      id: Number(product.id),
      name: String(product.name),
      price,
      quantity: line.quantity,
      image_url: product.image_url ?? "",
    });
  }

  const itemsTotal = money(items.reduce((sum, i) => sum + i.price! * i.quantity, 0));
  const deliveryCost = money(getDeliveryCost(deliveryType, itemsTotal));
  return { items, itemsTotal, deliveryCost, total: money(itemsTotal + deliveryCost), rejected };
}

/**
 * What the checkout page renders. Public and unauthenticated like `createOrder`, and validated
 * the same way — it only reads.
 */
export async function quoteOrder({
  items,
  deliveryType,
}: {
  items: OrderLine[];
  deliveryType: string;
}): Promise<{ ok: true; quote: Quote } | Failure> {
  if (!DELIVERY_OPTIONS.some((o) => o.id === deliveryType)) return fail("Выберите способ доставки.");

  const lines = parseLines(items);
  if (!lines) return fail("Корзина повреждена. Обновите страницу и попробуйте ещё раз.");

  try {
    return { ok: true as const, quote: await buildQuote(createAdminClient(), lines, deliveryType) };
  } catch (err) {
    console.error("[checkout] quote failed", err);
    return fail("Не удалось рассчитать заказ. Попробуйте ещё раз.");
  }
}

export async function createOrder({
  name,
  phone,
  address,
  comment,
  items,
  deliveryType,
  quotedTotal,
}: {
  name: string;
  phone: string;
  address: string;
  comment: string;
  items: OrderLine[];
  deliveryType: string;
  /** Total the customer was shown, from `quoteOrder`. Mismatch means prices moved mid-checkout. */
  quotedTotal?: number;
}): Promise<CreateOrderResult> {
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

  const quote = await buildQuote(admin, lines, deliveryType);

  // Naming the offending lines is what lets the client prune them; the previous blanket message
  // left the customer retrying the same broken cart forever.
  if (quote.rejected.length > 0) {
    return { ok: false as const, error: "Часть товаров больше не доступна.", rejected: quote.rejected };
  }

  // The client showed a server quote before submitting. If prices moved in between, don't charge
  // silently — hand back the new quote and let the customer confirm it.
  if (quotedTotal != null && money(quotedTotal) !== quote.total) {
    return { ok: false as const, error: "Цены изменились, проверьте заказ.", quote };
  }

  const { items: orderItems, itemsTotal, deliveryCost, total } = quote;

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

  // Only purchase_count changed, and that is a sort key for exactly two cached queries. Expiring
  // the shared "products" tag invalidated all nine — homepage, categories, brands, /new, /sale,
  // /popular, every product page — and updateTag has no stale-while-revalidate, so the next
  // visitor waited for a full re-fetch. Those entries carry revalidate: 60 anyway.
  updateTag("products-popular");

  const orderId = String(data.id);
  // The invoice used `new Date()`, evaluated inside after(), so the emailed document carried a
  // different timestamp than the one a re-download from the admin prints.
  const createdAt = data.created_at ? new Date(data.created_at) : new Date();
  const deliveryLabel = DELIVERY_OPTIONS.find((o) => o.id === deliveryType)!.label;

  // The invoice and the admin email must never block the confirmation — or fail it. The order
  // is already committed at this point, so an SMTP outage or a missing font would otherwise
  // surface to the customer as a failed checkout and get retried into a duplicate order.
  after(async () => {
    try {
      const invoicePdf = await generateInvoicePdf({
        orderId,
        createdAt,
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
      const result = await sendNewOrderEmail(
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

      // Recorded so "which orders were never emailed?" is answerable, and visible in the admin
      // list. A failure here leaves notified_at NULL rather than pretending success.
      if (result.sent) await markOrderNotified(admin, Number(data.id));
      else console.error(`[checkout] order ${orderId} was NOT notified: ${result.reason}`);
    } catch (err) {
      console.error(`[checkout] post-order notification failed for order ${orderId}`, err);
    }
  });

  return { ok: true as const, orderId };
}
