import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

export async function getActiveBanners(supabase: SupabaseClient<Database>, type: "desktop" | "mobile") {
  const { data } = await supabase
    .from("banners")
    .select("id, image_url, link")
    .eq("active", true)
    .eq("type", type)
    .order("sort_order");
  return data ?? [];
}

export async function getAllBanners(supabase: SupabaseClient<Database>, type: "desktop" | "mobile") {
  const { data } = await supabase.from("banners").select("*").eq("type", type).order("sort_order");
  return data ?? [];
}
