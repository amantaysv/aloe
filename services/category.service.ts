import type { SupabaseClient } from "@supabase/supabase-js";
import { strict } from "@/lib/db";
import type { Database } from "@/types/database";

/**
 * `strict`: every category page resolves its slug against this list, and the root layout builds
 * the nav from it. Returning an empty array on failure turned a transient database error into a
 * 404 that then got cached — better to surface it and let error.tsx offer a retry.
 */
export async function getCategories(supabase: SupabaseClient<Database>) {
  return strict("categories", await supabase.from("categories").select("*").order("sort_order").order("name"));
}

export async function getCategoriesWithSlug(supabase: SupabaseClient<Database>) {
  return strict(
    "categories-with-slug",
    await supabase.from("categories").select("id, name, parent_id, slug").order("sort_order").order("name"),
  );
}
