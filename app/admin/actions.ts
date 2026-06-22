"use server";
import { createClient } from "@/lib/supabase-server";
import { createClient as createSupabase } from "@supabase/supabase-js";

async function assertAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user || user.app_metadata?.role !== "admin") throw new Error("Unauthorized");
}

function adminDb() {
  return createSupabase(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
}

export async function updateOrderStatus(orderId: string, status: string) {
  await assertAdmin();
  const { error } = await adminDb().from("orders").update({ status }).eq("id", orderId);
  if (error) throw new Error(error.message);
}

export type ProductInput = {
  id?: number;
  external_id?: string;
  name: string;
  price: number;
  old_price?: number | null;
  image_url: string;
  product_url?: string;
  category: string;
  category_id: number;
  label?: "popular" | "new" | "sale" | "discount" | null;
  description?: string | null;
  manufacturer?: string | null;
  seo_text?: string | null;
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
    return { ok: true, id };
  }

  const { data: row, error } = await db.from("products").insert(data).select("id").single();
  if (error) return { ok: false, error: error.message };
  return { ok: true, id: row.id };
}

export async function deleteProduct(id: number): Promise<{ ok: true } | { ok: false; error: string }> {
  await assertAdmin();
  const { error } = await adminDb().from("products").delete().eq("id", id);
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

export type CategoryInput = {
  id?: number;
  name: string;
  parent_id: number | null;
  slug: string;
};

export async function upsertCategory(
  data: CategoryInput,
): Promise<{ ok: true; id: number } | { ok: false; error: string }> {
  await assertAdmin();
  const db = adminDb();
  const fields = { name: data.name, parent_id: data.parent_id, slug: data.slug };
  if (data.id) {
    const { error } = await db.from("categories").update(fields).eq("id", data.id);
    if (error) return { ok: false, error: error.message };
    return { ok: true, id: data.id };
  }
  const { data: row, error } = await db.from("categories").insert(fields).select("id").single();
  if (error) return { ok: false, error: error.message };
  return { ok: true, id: row.id };
}

export async function deleteCategory(id: number): Promise<{ ok: true } | { ok: false; error: string }> {
  await assertAdmin();
  const { error } = await adminDb().from("categories").delete().eq("id", id);
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

export type BannerInput = {
  id?: number;
  image_url: string;
  sort_order: number;
  active: boolean;
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
    return { ok: true, id };
  }
  const { data: row, error } = await db.from("banners").insert(data).select("id").single();
  if (error) return { ok: false, error: error.message };
  return { ok: true, id: row.id };
}

export async function deleteBanner(id: number): Promise<{ ok: true } | { ok: false; error: string }> {
  await assertAdmin();
  const { error } = await adminDb().from("banners").delete().eq("id", id);
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

export async function uploadBannerImage(
  formData: FormData,
): Promise<{ ok: true; url: string } | { ok: false; error: string }> {
  await assertAdmin();
  const file = formData.get("file") as File | null;
  if (!file || !file.size) return { ok: false, error: "Файл не выбран" };
  const ext = file.name.split(".").pop() ?? "jpg";
  const path = `banners/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
  const buffer = Buffer.from(await file.arrayBuffer());
  const db = adminDb();
  const { error } = await db.storage.from("product-images").upload(path, buffer, { contentType: file.type });
  if (error) return { ok: false, error: error.message };
  const { data } = db.storage.from("product-images").getPublicUrl(path);
  return { ok: true, url: data.publicUrl };
}

export async function getManufacturers(): Promise<{ ok: true; data: string[] } | { ok: false; error: string }> {
  await assertAdmin();
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("products")
    .select("manufacturer")
    .not("manufacturer", "is", null);
  if (error) return { ok: false, error: error.message };
  const manufacturers = [...new Set(data.map((p) => p.manufacturer as string))].sort((a, b) =>
    a.localeCompare(b, "ru"),
  );
  return { ok: true, data: manufacturers };
}

export async function uploadProductImage(
  formData: FormData,
): Promise<{ ok: true; url: string } | { ok: false; error: string }> {
  await assertAdmin();
  const file = formData.get("file") as File | null;
  if (!file || !file.size) return { ok: false, error: "Файл не выбран" };

  const ext = file.name.split(".").pop() ?? "jpg";
  const path = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
  const buffer = Buffer.from(await file.arrayBuffer());

  const db = adminDb();
  const { error } = await db.storage.from("product-images").upload(path, buffer, { contentType: file.type });
  if (error) return { ok: false, error: error.message };

  const { data } = db.storage.from("product-images").getPublicUrl(path);
  return { ok: true, url: data.publicUrl };
}
