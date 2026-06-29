import type { SupabaseClient } from "@supabase/supabase-js";

export async function getCategories(supabase: SupabaseClient) {
  const { data } = await supabase.from("categories").select("*").order("name");
  return data ?? [];
}

export async function getCategoriesWithSlug(supabase: SupabaseClient) {
  const { data } = await supabase.from("categories").select("id, name, parent_id, slug").order("name");
  return data ?? [];
}

export async function getAdminCategories(supabase: SupabaseClient) {
  const { data } = await supabase.from("categories").select("*").order("name");
  return data ?? [];
}
