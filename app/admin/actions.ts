"use server";

import { createClient as createSupabase } from "@supabase/supabase-js";
import { revalidatePath, updateTag } from "next/cache";
import { createClient } from "@/lib/supabase-server";
import { getAdminBrands } from "@/services/brand.service";

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
  name: string;
  price: number;
  old_price?: number | null;
  image_url: string;
  category: string;
  category_id: number;
  label?: "popular" | "new" | "sale" | null;
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
  let sort_order = 0;
  if (data.parent_id !== null) {
    const { count } = await db
      .from("categories")
      .select("id", { count: "exact", head: true })
      .eq("parent_id", data.parent_id);
    sort_order = count ?? 0;
  }
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
  const file = formData.get("file") as File | null;
  if (!file || !file.size) return { ok: false, error: "Файл не выбран" };
  const ext = file.name.split(".").pop() ?? "jpg";
  const path = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
  const buffer = Buffer.from(await file.arrayBuffer());
  const db = adminDb();
  const { error } = await db.storage.from("categories").upload(path, buffer, { contentType: file.type });
  if (error) return { ok: false, error: error.message };
  const { data } = db.storage.from("categories").getPublicUrl(path);
  return { ok: true, url: data.publicUrl };
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
  return { ok: true };
}

export async function uploadBannerImage(
  formData: FormData,
): Promise<{ ok: true; url: string } | { ok: false; error: string }> {
  await assertAdmin();
  const file = formData.get("file") as File | null;
  if (!file || !file.size) return { ok: false, error: "Файл не выбран" };
  const ext = file.name.split(".").pop() ?? "jpg";
  const path = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
  const buffer = Buffer.from(await file.arrayBuffer());
  const db = adminDb();
  const { error } = await db.storage.from("banners").upload(path, buffer, { contentType: file.type });
  if (error) return { ok: false, error: error.message };
  const { data } = db.storage.from("banners").getPublicUrl(path);
  return { ok: true, url: data.publicUrl };
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
    return { ok: true, id: data.id };
  }
  const { data: row, error } = await db.from("brands").insert(fields).select("id").single();
  if (error) return { ok: false, error: error.message };
  return { ok: true, id: row.id };
}

export async function deleteBrand(id: number): Promise<{ ok: true } | { ok: false; error: string }> {
  await assertAdmin();
  const { error } = await adminDb().from("brands").delete().eq("id", id);
  if (error) return { ok: false, error: error.message };
  return { ok: true };
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
