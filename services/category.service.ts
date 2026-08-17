import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

export async function getCategories(supabase: SupabaseClient<Database>) {
  const { data } = await supabase.from("categories").select("*").order("sort_order").order("name");
  return data ?? [];
}

export async function getCategoriesWithSlug(supabase: SupabaseClient<Database>) {
  const { data } = await supabase
    .from("categories")
    .select("id, name, parent_id, slug")
    .order("sort_order")
    .order("name");
  return data ?? [];
}

export async function getAdminCategories(supabase: SupabaseClient<Database>) {
  const { data } = await supabase.from("categories").select("*").order("sort_order").order("name");
  return data ?? [];
}
