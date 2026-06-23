import type { SupabaseClient } from "@supabase/supabase-js";

export async function getCategories(supabase: SupabaseClient) {
  const { data } = await supabase.from("categories").select("*");
  return data ?? [];
}

export async function getCategoriesWithSlug(supabase: SupabaseClient) {
  const { data } = await supabase.from("categories").select("id, name, parent_id, slug");
  return data ?? [];
}

export async function getAdminCategories(supabase: SupabaseClient) {
  const { data } = await supabase.from("categories").select("*").order("name");
  return data ?? [];
}
