import type { SupabaseClient } from "@supabase/supabase-js";
import type { ProductRow } from "@/types";
import { withBrandName } from "@/types";

export type SortValue = "name" | "price_asc" | "price_desc";
export type AdminProductsSort = "id-desc" | "name-asc" | "price-asc" | "price-desc";

export async function getProductsByLabel(supabase: SupabaseClient, label: "popular" | "new" | "sale", limit = 10) {
  const { data, count } = await supabase
    .from("products")
    .select("*, brands(name)", { count: "exact" })
    .eq("published", true)
    .eq("label", label)
    .limit(limit);
  return { products: withBrandName((data ?? []) as unknown as ProductRow[]), total: count ?? 0 };
}

export async function getProductsByCategories(supabase: SupabaseClient, categoryIds: string[], limit = 10) {
  const { data, count } = await supabase
    .from("products")
    .select("*, brands(name)", { count: "exact" })
    .eq("published", true)
    .in("category_id", categoryIds)
    .limit(limit);
  return { products: withBrandName((data ?? []) as unknown as ProductRow[]), total: count ?? 0 };
}

export async function getHomePageCategoryProducts(
  supabase: SupabaseClient,
  groups: Array<{ topId: string; allIds: string[] }>,
  limitPerCategory = 10,
) {
  const allIds = [...new Set(groups.flatMap((g) => g.allIds))];
  if (allIds.length === 0) return groups.map((g) => ({ topId: g.topId, products: [], total: 0 }));

  const { data } = await supabase
    .from("products")
    .select("*, brands(name)")
    .eq("published", true)
    .in("category_id", allIds)
    .order("name");

  const allProducts = withBrandName((data ?? []) as unknown as ProductRow[]);

  return groups.map(({ topId, allIds: ids }) => {
    const idsSet = new Set(ids.map(String));
    const grouped = allProducts.filter((p) => idsSet.has(String(p.category_id)));
    return { topId, products: grouped.slice(0, limitPerCategory), total: grouped.length };
  });
}

export async function getProduct(supabase: SupabaseClient, id: string) {
  return supabase.from("products").select("*, brands(name, slug)").eq("id", id).eq("published", true).single();
}

export async function getRelatedProducts(supabase: SupabaseClient, categoryId: string, excludeId: string, limit = 4) {
  const { data } = await supabase
    .from("products")
    .select("*, brands(name)")
    .eq("published", true)
    .eq("category_id", categoryId)
    .neq("id", excludeId)
    .limit(limit);
  return withBrandName((data ?? []) as unknown as ProductRow[]);
}

export async function getSubcategorySection(supabase: SupabaseClient, subcategoryId: string, sort: SortValue) {
  const orderCol = sort === "price_asc" || sort === "price_desc" ? "price" : "name";
  const ascending = sort !== "price_desc";
  const { data, count } = await supabase
    .from("products")
    .select("*, brands(name)", { count: "exact" })
    .eq("published", true)
    .eq("category_id", subcategoryId)
    .order(orderCol, { ascending });
  return { products: withBrandName((data ?? []) as unknown as ProductRow[]), total: count ?? 0 };
}

export async function getSubcategoryProducts(
  supabase: SupabaseClient,
  subcategoryId: string,
  options: { page: number; sort: SortValue; brandIds?: number[]; pageSize?: number },
) {
  const { page, sort, brandIds = [], pageSize = 20 } = options;
  const from = (page - 1) * pageSize;

  let query = supabase
    .from("products")
    .select("*, brands(name)", { count: "exact" })
    .eq("published", true)
    .eq("category_id", subcategoryId);

  if (brandIds.length > 0) query = query.in("brand_id", brandIds);

  if (sort === "price_asc") query = query.order("price", { ascending: true });
  else if (sort === "price_desc") query = query.order("price", { ascending: false });
  else query = query.order("name");

  const { data, count } = await query.range(from, from + pageSize - 1);
  return { products: withBrandName((data ?? []) as unknown as ProductRow[]), total: count ?? 0 };
}

export async function getBrandsForSubcategory(supabase: SupabaseClient, subcategoryId: string) {
  const { data } = await supabase
    .from("products")
    .select("brands(id, name)")
    .eq("published", true)
    .eq("category_id", subcategoryId)
    .not("brand_id", "is", null);
  return extractUniqueBrands(data);
}

export async function searchProducts(
  supabase: SupabaseClient,
  query: string,
  options: { brandIds?: number[]; page: number; pageSize?: number },
) {
  const { brandIds = [], page, pageSize = 24 } = options;
  const from = (page - 1) * pageSize;

  let q = supabase
    .from("products")
    .select("*, brands(name)", { count: "exact" })
    .eq("published", true)
    .ilike("name", `%${query}%`)
    .order("name")
    .range(from, from + pageSize - 1);

  if (brandIds.length > 0) q = q.in("brand_id", brandIds);

  const { data, count } = await q;
  return { products: withBrandName((data ?? []) as unknown as ProductRow[]), total: count ?? 0 };
}

export async function getBrandsForSearch(supabase: SupabaseClient, query: string) {
  const { data } = await supabase
    .from("products")
    .select("brands(id, name)")
    .eq("published", true)
    .ilike("name", `%${query}%`)
    .not("brand_id", "is", null);
  return extractUniqueBrands(data);
}

export async function getProductsByBrand(
  supabase: SupabaseClient,
  brandId: number,
  options: { page: number; pageSize?: number },
) {
  const { page, pageSize = 24 } = options;
  const from = (page - 1) * pageSize;
  const { data, count } = await supabase
    .from("products")
    .select("*", { count: "exact" })
    .eq("published", true)
    .eq("brand_id", brandId)
    .order("name")
    .range(from, from + pageSize - 1);
  return { products: data ?? [], total: count ?? 0 };
}

export async function getProductsByLabelPaginated(
  supabase: SupabaseClient,
  label: string,
  options: { page: number; pageSize?: number },
) {
  const { page, pageSize = 20 } = options;
  const from = (page - 1) * pageSize;
  const { data, count } = await supabase
    .from("products")
    .select("*, brands(name)", { count: "exact" })
    .eq("published", true)
    .eq("label", label)
    .order("name")
    .range(from, from + pageSize - 1);
  return { products: withBrandName((data ?? []) as unknown as ProductRow[]), total: count ?? 0 };
}

export async function searchProductsAutocomplete(supabase: SupabaseClient, query: string, limit = 6) {
  const { data } = await supabase
    .from("products")
    .select("id, name, price, image_url, category_id")
    .eq("published", true)
    .ilike("name", `%${query}%`)
    .limit(limit);
  return data ?? [];
}

export async function getAdminProducts(
  supabase: SupabaseClient,
  options: {
    q?: string;
    label?: string;
    published?: string;
    sort?: AdminProductsSort;
    page?: number;
    pageSize?: number;
  },
) {
  const { q = "", label = "", published = "", sort = "id-desc", page = 1, pageSize = 20 } = options;
  const from = (page - 1) * pageSize;

  let query = supabase.from("products").select("*", { count: "exact" });
  if (q) query = query.or(`name.ilike.%${q}%,category.ilike.%${q}%`);
  if (label === "none") query = query.is("label", null);
  else if (label) query = query.eq("label", label);
  if (published === "yes") query = query.eq("published", true);
  else if (published === "no") query = query.eq("published", false);
  if (sort === "name-asc") query = query.order("name");
  else if (sort === "price-asc") query = query.order("price", { ascending: true });
  else if (sort === "price-desc") query = query.order("price", { ascending: false });
  else query = query.order("created_at", { ascending: false }).order("id", { ascending: false });

  const { data, count } = await query.range(from, from + pageSize - 1);
  return { products: data ?? [], total: count ?? 0 };
}

export async function getProductCategoryIds(supabase: SupabaseClient) {
  const { data } = await supabase.from("products").select("category_id").not("category_id", "is", null);
  return [...new Set((data ?? []).map((p) => p.category_id as number))];
}

export async function getProductBrandIds(supabase: SupabaseClient) {
  const { data } = await supabase.from("products").select("brand_id").not("brand_id", "is", null);
  return [...new Set((data ?? []).map((p) => p.brand_id as number).filter(Boolean))];
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
