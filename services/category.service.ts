import type { SupabaseClient } from "@supabase/supabase-js";
import { soft, strict } from "@/lib/db";
import type { Database } from "@/types/database";

/**
 * `soft`, deliberately: this feeds the nav in the *root* layout, and a throw there cannot be
 * caught by app/error.tsx (that boundary is nested inside the layout) — it escalates to
 * global-error.tsx, i.e. "site unavailable" on every route, and it fails `next build`, which
 * renders the root layout for every prerendered page. An empty nav is the better failure.
 */
export async function getCategories(supabase: SupabaseClient<Database>) {
  return soft("categories", await supabase.from("categories").select("*").order("sort_order").order("name"), []);
}

/** `strict`: this one resolves slugs, and an empty list would turn an outage into a cached 404. */
export async function getCategoriesWithSlug(supabase: SupabaseClient<Database>) {
  return strict(
    "categories-with-slug",
    await supabase.from("categories").select("id, name, parent_id, slug").order("sort_order").order("name"),
  );
}
