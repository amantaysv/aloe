import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/constants";
import { supabase } from "@/lib/supabase";

export const revalidate = 3600;

const STATIC_PAGES: Array<{
  path: string;
  priority: number;
  changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"];
}> = [
  { path: "", priority: 1, changeFrequency: "daily" },
  { path: "/catalog", priority: 0.9, changeFrequency: "daily" },
  { path: "/brands", priority: 0.7, changeFrequency: "weekly" },
  { path: "/new", priority: 0.8, changeFrequency: "daily" },
  { path: "/sale", priority: 0.8, changeFrequency: "daily" },
  { path: "/popular", priority: 0.8, changeFrequency: "daily" },
  { path: "/delivery", priority: 0.4, changeFrequency: "monthly" },
  { path: "/about", priority: 0.4, changeFrequency: "monthly" },
  { path: "/contacts", priority: 0.4, changeFrequency: "monthly" },
  { path: "/legal-entities", priority: 0.3, changeFrequency: "monthly" },
];

async function getAllPublishedProducts() {
  const pageSize = 1000;
  const rows: { id: number; created_at: string; category_id: number; brand_id: number | null }[] = [];
  for (let from = 0; ; from += pageSize) {
    const { data } = await supabase
      .from("products")
      .select("id, created_at, category_id, brand_id")
      .eq("published", true)
      .order("id")
      .range(from, from + pageSize - 1);
    if (!data || data.length === 0) break;
    rows.push(...data);
    if (data.length < pageSize) break;
  }
  return rows;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [{ data: categories }, { data: brands }, products] = await Promise.all([
    supabase.from("categories").select("id, slug, parent_id"),
    supabase.from("brands").select("id, slug"),
    getAllPublishedProducts(),
  ]);

  // Only entities that actually have published products. BrandPage calls notFound() when a brand
  // has none, and CategoryPage when no subcategory section is non-empty — submitting those filled
  // Search Console with "submitted URL not found (404)", which discredits the whole sitemap.
  const productCategoryIds = new Set(products.map((p) => p.category_id));
  const productBrandIds = new Set(products.map((p) => p.brand_id).filter((id): id is number => id != null));

  /** A category counts as non-empty if it, or anything beneath it, holds a published product. */
  const childrenOf = new Map<number, number[]>();
  for (const c of categories ?? []) {
    if (c.parent_id != null) {
      if (!childrenOf.has(c.parent_id)) childrenOf.set(c.parent_id, []);
      childrenOf.get(c.parent_id)!.push(c.id);
    }
  }
  const hasProducts = (id: number): boolean =>
    productCategoryIds.has(id) || (childrenOf.get(id) ?? []).some(hasProducts);

  // Sub-subcategories (parent itself has a parent) have no page of their own — skip them.
  // Subcategories are skipped too: ?sub= is only a scroll anchor, the content is identical to the
  // parent URL and generateMetadata points its canonical there, so they were submitted as
  // duplicates that could never rank.
  const categoryUrls: MetadataRoute.Sitemap = (categories ?? [])
    .filter((c) => !c.parent_id && hasProducts(c.id))
    .map((c) => ({
      url: `${SITE_URL}/catalog/${c.slug}`,
      changeFrequency: "daily",
      priority: 0.8,
    }));

  const brandUrls: MetadataRoute.Sitemap = (brands ?? [])
    .filter((b) => productBrandIds.has(b.id))
    .map((b) => ({
      url: `${SITE_URL}/brands/${b.slug}`,
      changeFrequency: "weekly",
      priority: 0.6,
    }));

  const productUrls: MetadataRoute.Sitemap = products.map((p) => ({
    url: `${SITE_URL}/product/${p.id}`,
    lastModified: p.created_at,
    changeFrequency: "weekly",
    priority: 0.6,
  }));

  const staticUrls: MetadataRoute.Sitemap = STATIC_PAGES.map((p) => ({
    url: `${SITE_URL}${p.path}`,
    changeFrequency: p.changeFrequency,
    priority: p.priority,
  }));

  return [...staticUrls, ...categoryUrls, ...brandUrls, ...productUrls];
}
