import type { SupabaseClient } from "@supabase/supabase-js";

export async function getActiveBanners(supabase: SupabaseClient) {
  const { data } = await supabase.from("banners").select("id, image_url, link").eq("active", true).order("sort_order");
  return data ?? [];
}

export async function getAllBanners(supabase: SupabaseClient) {
  const { data } = await supabase.from("banners").select("*").order("sort_order");
  return data ?? [];
}
