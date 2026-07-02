import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/constants";
import { supabase } from "@/lib/supabase";

export const revalidate = 3600;

const STATIC_PAGES: Array<{ path: string; priority: number; changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"] }> = [
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
  const rows: { id: number; created_at: string }[] = [];
  for (let from = 0; ; from += pageSize) {
    const { data } = await supabase
      .from("products")
      .select("id, created_at")
      .eq("published", true)
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
    supabase.from("brands").select("slug"),
    getAllPublishedProducts(),
  ]);

  const categoryById = new Map((categories ?? []).map((c) => [c.id, c]));

  const categoryUrls: MetadataRoute.Sitemap = (categories ?? []).map((c) => {
    const path = c.parent_id ? `/catalog/${categoryById.get(c.parent_id)?.slug}/${c.slug}` : `/catalog/${c.slug}`;
    return {
      url: `${SITE_URL}${path}`,
      changeFrequency: "daily",
      priority: c.parent_id ? 0.7 : 0.8,
    };
  });

  const brandUrls: MetadataRoute.Sitemap = (brands ?? []).map((b) => ({
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
