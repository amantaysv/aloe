import type { SupabaseClient } from "@supabase/supabase-js";
import type { ProductListItem, ProductListRow } from "@/types";
import { withBrandName } from "@/types";
import type { Database } from "@/types/database";

/**
 * The only columns a product card needs. Selecting `*` here pulls `description` and `seo_text`
 * — long free text — into every grid, carousel and RSC payload on the site.
 */
const LIST_COLUMNS = "id, name, price, old_price, image_url, category_id, label, brand_id, brands(name)";

/**
 * Stays "exact": these totals are user-visible ("Смотреть все N") and on the homepage
 * `total > 0` decides whether a carousel renders at all — a planner estimate can be 0 for a
 * non-empty set. Where the total equals the number of rows returned, we skip the count instead.
 */
const COUNT: { count: "exact" } = { count: "exact" };

function toList(data: unknown, count: number | null): { products: ProductListItem[]; total: number } {
  return { products: withBrandName((data ?? []) as unknown as ProductListRow[]), total: count ?? 0 };
}

/**
 * `%` and `_` are LIKE wildcards and PostgREST additionally rewrites `*` to `%`, so an
 * unescaped search term of `%` or `*` matches the entire catalogue — a full sequential scan
 * plus an exact COUNT over every row.
 */
function escapeLike(value: string): string {
  return value.replace(/\*/g, "").replace(/[\\%_]/g, (c) => `\\${c}`);
}

function range(page: number, pageSize: number): [number, number] {
  const from = (page - 1) * pageSize;
  return [from, from + pageSize - 1];
}

/** Upper bound for the admin list's "показать все" mode. */
const ADMIN_ALL_CAP = 5000;

export type SortValue = "name" | "price_asc" | "price_desc";
export type AdminProductsSort = "id-desc" | "name-asc" | "price-asc" | "price-desc" | "purchase-count-desc";

export async function getProductsByLabel(supabase: SupabaseClient<Database>, label: "new" | "sale", limit = 10) {
  const { data, count } = await supabase
    .from("products")
    .select(LIST_COLUMNS, COUNT)
    .eq("published", true)
    .eq("label", label)
    .order("id", { ascending: false })
    .limit(limit);
  return toList(data, count);
}

export async function getPopularProducts(supabase: SupabaseClient<Database>, limit = 10) {
  const { data, count } = await supabase
    .from("products")
    .select(LIST_COLUMNS, COUNT)
    .eq("published", true)
    .gt("purchase_count", 0)
    .order("purchase_count", { ascending: false })
    .order("id")
    .limit(limit);
  return toList(data, count);
}

export async function getPopularProductsPaginated(
  supabase: SupabaseClient<Database>,
  options: { page: number; pageSize?: number },
) {
  const { page, pageSize = 20 } = options;
  const { data, count } = await supabase
    .from("products")
    .select(LIST_COLUMNS, COUNT)
    .eq("published", true)
    .gt("purchase_count", 0)
    .order("purchase_count", { ascending: false })
    .order("id")
    .range(...range(page, pageSize));
  return toList(data, count);
}

/**
 * One limited query per top-level category, run in parallel. The previous version fetched every
 * published product in every category in a single unbounded query and sliced to ten in JS —
 * effectively `select * from products` on each homepage revalidation, silently truncated by
 * PostgREST's max-rows (which also made `total` wrong).
 */
export async function getHomePageCategoryProducts(
  supabase: SupabaseClient<Database>,
  groups: Array<{ topId: number; allIds: number[] }>,
  limitPerCategory = 10,
) {
  return Promise.all(
    groups.map(async ({ topId, allIds }) => {
      if (allIds.length === 0) return { topId, products: [], total: 0 };
      const { data, count } = await supabase
        .from("products")
        .select(LIST_COLUMNS, COUNT)
        .eq("published", true)
        .in("category_id", allIds)
        .order("name")
        .limit(limitPerCategory);
      const { products, total } = toList(data, count);
      return { topId, products, total };
    }),
  );
}

export async function getProduct(supabase: SupabaseClient<Database>, id: number) {
  return supabase.from("products").select("*, brands(name, slug)").eq("id", id).eq("published", true).single();
}

export async function getRelatedProducts(
  supabase: SupabaseClient<Database>,
  categoryId: number,
  excludeId: number,
  limit = 4,
) {
  const { data } = await supabase
    .from("products")
    .select(LIST_COLUMNS)
    .eq("published", true)
    .eq("category_id", categoryId)
    .neq("id", excludeId)
    .order("id")
    .limit(limit);
  return withBrandName((data ?? []) as unknown as ProductListRow[]);
}

export async function getSubcategorySection(
  supabase: SupabaseClient<Database>,
  categoryIds: number[],
  sort: SortValue,
  brandIds: number[] = [],
) {
  const orderCol = sort === "price_asc" || sort === "price_desc" ? "price" : "name";
  const ascending = sort !== "price_desc";
  let query = supabase.from("products").select(LIST_COLUMNS).eq("published", true).in("category_id", categoryIds);

  if (brandIds.length > 0) query = query.in("brand_id", brandIds);

  // No .range(): the category page renders every section in one virtualized scroll. Since the
  // query is unbounded, the row count *is* the total — no separate exact COUNT pass needed.
  const { data } = await query.order(orderCol, { ascending }).order("id");
  const products = withBrandName((data ?? []) as unknown as ProductListRow[]);
  return { products, total: products.length };
}

export async function searchProducts(
  supabase: SupabaseClient<Database>,
  query: string,
  options: { brandIds?: number[]; page: number; pageSize?: number },
) {
  const { brandIds = [], page, pageSize = 24 } = options;
  const from = (page - 1) * pageSize;

  let q = supabase
    .from("products")
    .select(LIST_COLUMNS, COUNT)
    .eq("published", true)
    .ilike("name", `%${escapeLike(query)}%`)
    .order("name")
    .order("id")
    .range(from, from + pageSize - 1);

  if (brandIds.length > 0) q = q.in("brand_id", brandIds);

  const { data, count } = await q;
  return toList(data, count);
}

/**
 * Brand facet for a search term. Capped: previously this re-ran the same `ilike` with no limit
 * and pulled one row per matching product just to dedupe brands in JS, so a broad query scanned
 * and transferred the whole matching set a second time.
 */
export async function getBrandsForSearch(supabase: SupabaseClient<Database>, query: string, limit = 1000) {
  const { data } = await supabase
    .from("products")
    .select("brands(id, name)")
    .eq("published", true)
    .ilike("name", `%${escapeLike(query)}%`)
    .not("brand_id", "is", null)
    .order("brand_id")
    .limit(limit);
  return extractUniqueBrands(data);
}

export async function getProductsByBrand(
  supabase: SupabaseClient<Database>,
  brandId: number,
  options: { page: number; pageSize?: number },
) {
  const { page, pageSize = 24 } = options;
  const { data, count } = await supabase
    .from("products")
    .select(LIST_COLUMNS, COUNT)
    .eq("published", true)
    .eq("brand_id", brandId)
    .order("name")
    .order("id")
    .range(...range(page, pageSize));
  return toList(data, count);
}

export async function getProductsByLabelPaginated(
  supabase: SupabaseClient<Database>,
  label: string,
  options: { page: number; pageSize?: number },
) {
  const { page, pageSize = 20 } = options;
  const { data, count } = await supabase
    .from("products")
    .select(LIST_COLUMNS, COUNT)
    .eq("published", true)
    .eq("label", label)
    .order("name")
    .order("id")
    .range(...range(page, pageSize));
  return toList(data, count);
}

export async function searchProductsAutocomplete(supabase: SupabaseClient<Database>, query: string, limit = 6) {
  const { data } = await supabase
    .from("products")
    .select("id, name, price, image_url, category_id")
    .eq("published", true)
    .ilike("name", `%${escapeLike(query)}%`)
    .order("id")
    .limit(limit);
  return data ?? [];
}

export async function getAdminProducts(
  supabase: SupabaseClient<Database>,
  options: {
    q?: string;
    label?: string;
    published?: string;
    categoryId?: number;
    sort?: AdminProductsSort;
    page?: number;
    pageSize?: number | "all";
  },
) {
  const { q = "", label = "", published = "", categoryId, sort = "id-desc", page = 1, pageSize = 20 } = options;

  // Stays `select("*")` — the edit drawer needs description/seo_text/published.
  let query = supabase.from("products").select("*", { count: "exact" });
  if (q) query = query.ilike("name", `%${escapeLike(q)}%`);
  if (categoryId) query = query.eq("category_id", categoryId);
  if (label === "none") query = query.is("label", null);
  else if (label) query = query.eq("label", label);
  if (published === "yes") query = query.eq("published", true);
  else if (published === "no") query = query.eq("published", false);
  if (sort === "name-asc") query = query.order("name");
  else if (sort === "price-asc") query = query.order("price", { ascending: true });
  else if (sort === "price-desc") query = query.order("price", { ascending: false });
  else if (sort === "purchase-count-desc") query = query.order("purchase_count", { ascending: false });
  else query = query.order("created_at", { ascending: false }).order("id", { ascending: false });

  // "all" still gets an upper bound — the bulk-edit view would otherwise select every column
  // of every product in one response.
  query = pageSize === "all" ? query.range(0, ADMIN_ALL_CAP - 1) : query.range(...range(page, pageSize));

  const { data, count } = await query;
  return { products: data ?? [], total: count ?? 0 };
}

/**
 * Distinct id lookups, paged past PostgREST's max-rows. Without paging these silently returned
 * only the first 1000 products' worth of ids, and the admin UI used the result to decide whether
 * a category or brand was safe to delete — so an in-use one could be reported as unused.
 */
async function distinctIds(supabase: SupabaseClient<Database>, column: "category_id" | "brand_id"): Promise<number[]> {
  const pageSize = 1000;
  const ids = new Set<number>();
  for (let from = 0; ; from += pageSize) {
    const { data, error } = await supabase
      .from("products")
      .select(column)
      .not(column, "is", null)
      .order("id")
      .range(from, from + pageSize - 1);
    if (error) {
      console.error(`[products] distinct ${column} failed:`, error.message);
      break;
    }
    if (!data || data.length === 0) break;
    for (const row of data) {
      const value = (row as Record<string, unknown>)[column];
      if (typeof value === "number") ids.add(value);
    }
    if (data.length < pageSize) break;
  }
  return [...ids];
}

export async function getProductCategoryIds(supabase: SupabaseClient<Database>) {
  return distinctIds(supabase, "category_id");
}

export async function getProductBrandIds(supabase: SupabaseClient<Database>) {
  return distinctIds(supabase, "brand_id");
}

function extractUniqueBrands(data: unknown[] | null) {
  const seen = new Set<number>();
  const brands: { id: number; name: string }[] = [];
  for (const row of data ?? []) {
    const b = (row as { brands: { id: number; name: string } | null }).brands;
    if (b && !seen.has(b.id)) {
      seen.add(b.id);
      brands.push(b);
    }
  }
  return brands.sort((a, b) => a.name.localeCompare(b.name));
}
