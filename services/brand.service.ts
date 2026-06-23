import type { SupabaseClient } from "@supabase/supabase-js";

export async function getBrands(supabase: SupabaseClient) {
  const { data } = await supabase.from("brands").select("id, name, slug").order("name");
  return data ?? [];
}

export async function getBrandBySlug(supabase: SupabaseClient, slug: string) {
  const { data } = await supabase.from("brands").select("id, name, slug").eq("slug", slug).single();
  return data;
}

export async function getBrandNameBySlug(supabase: SupabaseClient, slug: string) {
  const { data } = await supabase.from("brands").select("name").eq("slug", slug).single();
  return data;
}

export async function getAdminBrands(supabase: SupabaseClient) {
  const { data } = await supabase.from("brands").select("id, name").order("name");
  return data ?? [];
}
