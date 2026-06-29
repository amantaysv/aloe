import type { SupabaseClient } from "@supabase/supabase-js";

export async function getActiveBanners(supabase: SupabaseClient) {
  const { data } = await supabase
    .from("banners")
    .select("id, image_url, link")
    .eq("active", true)
    .eq("type", "desktop")
    .order("sort_order");
  return data ?? [];
}

export async function getAllBanners(supabase: SupabaseClient, type: "desktop" | "mobile") {
  const { data } = await supabase.from("banners").select("*").eq("type", type).order("sort_order");
  return data ?? [];
}
