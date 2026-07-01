import type { SupabaseClient } from "@supabase/supabase-js";

export async function getCategories(supabase: SupabaseClient) {
  const { data } = await supabase.from("categories").select("*").order("sort_order").order("name");
  return data ?? [];
}

export async function getCategoriesWithSlug(supabase: SupabaseClient) {
  const { data } = await supabase
    .from("categories")
    .select("id, name, parent_id, slug")
    .order("sort_order")
    .order("name");
  return data ?? [];
}

export async function getAdminCategories(supabase: SupabaseClient) {
  const { data } = await supabase.from("categories").select("*").order("sort_order").order("name");
  return data ?? [];
}
