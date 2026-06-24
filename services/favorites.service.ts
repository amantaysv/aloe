import type { SupabaseClient } from "@supabase/supabase-js";
import type { ProductRow } from "@/types";
import { withBrandName } from "@/types";

export async function loadFavoriteIds(supabase: SupabaseClient, userId: string) {
  const { data, error } = await supabase.from("favorites").select("product_id").eq("user_id", userId);
  if (error) {
    console.error("[favorites] load error:", error.message);
    return [];
  }
  return (data ?? []).map((f: { product_id: number }) => f.product_id);
}

export async function addFavorite(supabase: SupabaseClient, userId: string, productId: number) {
  const { error } = await supabase.from("favorites").insert({ user_id: userId, product_id: productId });
  if (error) console.error("[favorites] add error:", error.message);
}

export async function removeFavorite(supabase: SupabaseClient, userId: string, productId: number) {
  const { error } = await supabase.from("favorites").delete().eq("user_id", userId).eq("product_id", productId);
  if (error) console.error("[favorites] remove error:", error.message);
}

export async function getFavoriteProducts(supabase: SupabaseClient, userId: string) {
  const { data } = await supabase
    .from("favorites")
    .select("product_id, products(*, brands(name))")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  return withBrandName(
    (data || []).map((f) => f.products as unknown as ProductRow | null).filter(Boolean) as ProductRow[],
  );
}
