"use server";

import { revalidatePath, updateTag } from "next/cache";
import { DELIVERY_OPTIONS, ORDER_STATUS } from "@/lib/constants";
import { generateInvoicePdf } from "@/lib/invoice";
import { createAdminClient } from "@/lib/supabase-admin";
import { createClient } from "@/lib/supabase-server";
import { getAdminBrands } from "@/services/brand.service";

async function assertAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user || user.app_metadata?.role !== "admin") throw new Error("Unauthorized");
}

const adminDb = createAdminClient;

/**
 * The storage buckets are public, so the stored Content-Type decides whether an object is
 * rendered as an image or executed as a document. Neither `file.type` nor `file.name` can be
 * trusted for that — an `.svg` served as `image/svg+xml` is stored XSS on the Supabase origin.
 */
const ALLOWED_IMAGE_TYPES: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/avif": "avif",
};

const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

async function uploadImage(
  bucket: "product-images" | "banners" | "categories",
  formData: FormData,
): Promise<{ ok: true; url: string } | { ok: false; error: string }> {
  const file = formData.get("file") as File | null;
  if (!file || !file.size) return { ok: false, error: "Файл не выбран" };

  const ext = ALLOWED_IMAGE_TYPES[file.type];
  if (!ext) return { ok: false, error: "Допустимы только JPEG, PNG, WebP и AVIF" };
  if (file.size > MAX_IMAGE_BYTES) return { ok: false, error: "Файл больше 5 МБ" };

  const path = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
  const buffer = Buffer.from(await file.arrayBuffer());

  const db = adminDb();
  const { error } = await db.storage.from(bucket).upload(path, buffer, { contentType: file.type });
  if (error) return { ok: false, error: error.message };

  const { data } = db.storage.from(bucket).getPublicUrl(path);
  return { ok: true, url: data.publicUrl };
}

export async function updateOrderStatus(orderId: number, status: string) {
  await assertAdmin();
  if (!(status in ORDER_STATUS)) throw new Error(`Unknown order status: ${status}`);
  const { error } = await adminDb().from("orders").update({ status }).eq("id", orderId);
  if (error) throw new Error(error.message);
}

export type OrderItemInput = {
  id: number;
  name: string;
  price: number;
  quantity: number;
  image_url: string;
};

export async function updateOrderItems(
  orderId: number,
  items: OrderItemInput[],
): Promise<{ ok: true; total: number } | { ok: false; error: string }> {
  await assertAdmin();
  const db = adminDb();

  const { data: order, error: fetchError } = await db.from("orders").select("delivery_cost").eq("id", orderId).single();
  if (fetchError || !order) return { ok: false, error: "Заказ не найден" };

  const itemsTotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const total = itemsTotal + (order.delivery_cost ?? 0);

  const { error } = await db.from("orders").update({ items, total }).eq("id", orderId);
  if (error) return { ok: false, error: error.message };

  revalidatePath("/admin/orders");
  return { ok: true, total };
}

export async function downloadInvoice(orderId: number): Promise<{ ok: true; base64: string } | { ok: false }> {
  await assertAdmin();
  const { data: order, error } = await adminDb().from("orders").select("*").eq("id", orderId).single();
  if (error || !order) return { ok: false };

  const itemsTotal = (order.items as { price: number; quantity: number }[]).reduce(
    (sum, i) => sum + i.price * i.quantity,
    0,
  );

  const pdf = await generateInvoicePdf({
    orderId: String(order.id),
    createdAt: new Date(order.created_at),
    name: order.customer_name ?? "",
    phone: order.customer_phone ?? "",
    address: order.customer_address ?? "",
    comment: order.comment ?? "",
    deliveryLabel: DELIVERY_OPTIONS.find((o) => o.id === order.delivery_type)?.label ?? order.delivery_type ?? "—",
    deliveryCost: order.delivery_cost ?? 0,
    items: order.items,
    itemsTotal,
    total: order.total,
  });

  return { ok: true, base64: pdf.toString("base64") };
}

export type ProductInput = {
  id?: number;
  name: string;
  price: number;
  old_price?: number | null;
  image_url: string;
  category: string;
  category_id: number;
  label?: "new" | "sale" | null;
  description?: string | null;
  brand_id?: number | null;
  seo_text?: string | null;
  published?: boolean;
};

export async function upsertProduct(
  data: ProductInput,
): Promise<{ ok: true; id: number } | { ok: false; error: string }> {
  await assertAdmin();
  const db = adminDb();

  if (data.id) {
    const { id, ...fields } = data;
    const { error } = await db.from("products").update(fields).eq("id", id);
    if (error) return { ok: false, error: error.message };
    updateTag("products");
    revalidatePath(`/product/${id}`);
    return { ok: true, id };
  }

  const { data: row, error } = await db.from("products").insert(data).select("id").single();
  if (error) return { ok: false, error: error.message };
  updateTag("products");
  revalidatePath(`/product/${row.id}`);
  return { ok: true, id: row.id };
}

export async function deleteProduct(id: number): Promise<{ ok: true } | { ok: false; error: string }> {
  await assertAdmin();
  const { error } = await adminDb().from("products").delete().eq("id", id);
  if (error) return { ok: false, error: error.message };
  updateTag("products");
  // The product's own ISR page would keep serving for up to `revalidate` seconds otherwise.
  revalidatePath(`/product/${id}`);
  return { ok: true };
}

export type BulkProductUpdate = {
  brand_id?: number | null;
  price?: number;
  old_price?: number | null;
  label?: "new" | "sale" | null;
  published?: boolean;
  category_id?: number;
  category?: string;
};

export async function bulkUpdateProducts(
  ids: number[],
  fields: BulkProductUpdate,
): Promise<{ ok: true } | { ok: false; error: string }> {
  await assertAdmin();
  if (ids.length === 0 || Object.keys(fields).length === 0) return { ok: true };
  const { error } = await adminDb().from("products").update(fields).in("id", ids);
  if (error) return { ok: false, error: error.message };
  updateTag("products");
  return { ok: true };
}

export type CategoryInput = {
  id?: number;
  name: string;
  parent_id: number | null;
  slug: string;
  image_url?: string | null;
};

export async function upsertCategory(
  data: CategoryInput,
): Promise<{ ok: true; id: number } | { ok: false; error: string }> {
  await assertAdmin();
  const db = adminDb();
  const fields = { name: data.name, parent_id: data.parent_id, slug: data.slug, image_url: data.image_url ?? null };
  if (data.id) {
    const { error } = await db.from("categories").update(fields).eq("id", data.id);
    if (error) return { ok: false, error: error.message };
    const { error: productsError } = await db
      .from("products")
      .update({ category: data.name })
      .eq("category_id", data.id);
    if (productsError) return { ok: false, error: productsError.message };
    updateTag("categories");
    updateTag("products");
    return { ok: true, id: data.id };
  }
  let countQuery = db.from("categories").select("id", { count: "exact", head: true });
  countQuery = data.parent_id !== null ? countQuery.eq("parent_id", data.parent_id) : countQuery.is("parent_id", null);
  const { count } = await countQuery;
  const sort_order = count ?? 0;
  const { data: row, error } = await db
    .from("categories")
    .insert({ ...fields, sort_order })
    .select("id")
    .single();
  if (error) return { ok: false, error: error.message };
  updateTag("categories");
  return { ok: true, id: row.id };
}

export async function uploadCategoryImage(
  formData: FormData,
): Promise<{ ok: true; url: string } | { ok: false; error: string }> {
  await assertAdmin();
  return uploadImage("categories", formData);
}

export async function deleteCategory(id: number): Promise<{ ok: true } | { ok: false; error: string }> {
  await assertAdmin();
  const { error } = await adminDb().from("categories").delete().eq("id", id);
  if (error) return { ok: false, error: error.message };
  updateTag("categories");
  return { ok: true };
}

export async function reorderSubcategories(
  items: { id: number; sort_order: number }[],
): Promise<{ ok: true } | { ok: false; error: string }> {
  await assertAdmin();
  const db = adminDb();
  const results = await Promise.all(
    items.map(({ id, sort_order }) => db.from("categories").update({ sort_order }).eq("id", id)),
  );
  const failed = results.find((r) => r.error);
  if (failed?.error) return { ok: false, error: failed.error.message };
  updateTag("categories");
  return { ok: true };
}

export type BannerInput = {
  id?: number;
  image_url: string;
  sort_order: number;
  active: boolean;
  link?: string | null;
  type?: "desktop" | "mobile";
};

export async function upsertBanner(
  data: BannerInput,
): Promise<{ ok: true; id: number } | { ok: false; error: string }> {
  await assertAdmin();
  const db = adminDb();
  if (data.id) {
    const { id, ...fields } = data;
    const { error } = await db.from("banners").update(fields).eq("id", id);
    if (error) return { ok: false, error: error.message };
    updateTag("banners");
    return { ok: true, id };
  }
  const { data: row, error } = await db.from("banners").insert(data).select("id").single();
  if (error) return { ok: false, error: error.message };
  updateTag("banners");
  return { ok: true, id: row.id };
}

export async function deleteBanner(id: number): Promise<{ ok: true } | { ok: false; error: string }> {
  await assertAdmin();
  const { error } = await adminDb().from("banners").delete().eq("id", id);
  if (error) return { ok: false, error: error.message };
  updateTag("banners");
  return { ok: true };
}

export async function reorderBanners(
  items: { id: number; sort_order: number }[],
): Promise<{ ok: true } | { ok: false; error: string }> {
  await assertAdmin();
  const db = adminDb();
  const results = await Promise.all(
    items.map(({ id, sort_order }) => db.from("banners").update({ sort_order }).eq("id", id)),
  );
  const failed = results.find((r) => r.error);
  if (failed?.error) return { ok: false, error: failed.error.message };
  updateTag("banners");
  return { ok: true };
}

export async function uploadBannerImage(
  formData: FormData,
): Promise<{ ok: true; url: string } | { ok: false; error: string }> {
  await assertAdmin();
  return uploadImage("banners", formData);
}

export async function getBrands(): Promise<
  { ok: true; data: { id: number; name: string }[] } | { ok: false; error: string }
> {
  await assertAdmin();
  const supabase = await createClient();
  const data = await getAdminBrands(supabase);
  return { ok: true, data };
}

export type BrandInput = {
  id?: number;
  name: string;
  slug: string;
};

export async function upsertBrand(data: BrandInput): Promise<{ ok: true; id: number } | { ok: false; error: string }> {
  await assertAdmin();
  const db = adminDb();
  const fields = { name: data.name, slug: data.slug };
  if (data.id) {
    const { error } = await db.from("brands").update(fields).eq("id", data.id);
    if (error) return { ok: false, error: error.message };
    // Product cards embed brands(name), so their cached payloads go stale too.
    updateTag("brands");
    updateTag("products");
    return { ok: true, id: data.id };
  }
  const { data: row, error } = await db.from("brands").insert(fields).select("id").single();
  if (error) return { ok: false, error: error.message };
  updateTag("brands");
  return { ok: true, id: row.id };
}

export async function deleteBrand(id: number): Promise<{ ok: true } | { ok: false; error: string }> {
  await assertAdmin();
  const { error } = await adminDb().from("brands").delete().eq("id", id);
  if (error) return { ok: false, error: error.message };
  updateTag("brands");
  updateTag("products");
  return { ok: true };
}

export async function uploadProductImage(
  formData: FormData,
): Promise<{ ok: true; url: string } | { ok: false; error: string }> {
  await assertAdmin();
  return uploadImage("product-images", formData);
}
