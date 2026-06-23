import { unstable_cache } from "next/cache";
import { supabase } from "@/lib/supabase";
import { getActiveBanners } from "@/services/banner.service";
import { getBrandBySlug, getBrands } from "@/services/brand.service";
import { getCategories, getCategoriesWithSlug } from "@/services/category.service";
import { getHomePageCategoryProducts, getProductsByCategories, getProductsByLabel, getProductsByBrand } from "@/services/product.service";

export const getCachedCategories = unstable_cache(
  () => getCategories(supabase),
  ["categories"],
  { revalidate: 3600, tags: ["categories"] },
);

export const getCachedCategoriesWithSlug = unstable_cache(
  () => getCategoriesWithSlug(supabase),
  ["categories-with-slug"],
  { revalidate: 3600, tags: ["categories"] },
);

export const getCachedActiveBanners = unstable_cache(
  () => getActiveBanners(supabase),
  ["banners"],
  { revalidate: 3600, tags: ["banners"] },
);

export const getCachedProductsByLabel = unstable_cache(
  (label: "popular" | "new" | "sale" | "discount", limit?: number) =>
    getProductsByLabel(supabase, label, limit),
  ["products-by-label"],
  { revalidate: 60, tags: ["products"] },
);

export const getCachedProductsByCategories = unstable_cache(
  (categoryIds: string[], limit?: number) => getProductsByCategories(supabase, categoryIds, limit),
  ["products-by-categories"],
  { revalidate: 60, tags: ["products"] },
);

export const getCachedHomePageCategoryProducts = unstable_cache(
  (groups: Array<{ topId: string; allIds: string[] }>, limitPerCategory?: number) =>
    getHomePageCategoryProducts(supabase, groups, limitPerCategory),
  ["home-category-products"],
  { revalidate: 60, tags: ["products"] },
);

export const getCachedBrands = unstable_cache(
  () => getBrands(supabase),
  ["brands"],
  { revalidate: 3600, tags: ["brands"] },
);

export const getCachedBrandBySlug = unstable_cache(
  (slug: string) => getBrandBySlug(supabase, slug),
  ["brand-by-slug"],
  { revalidate: 3600, tags: ["brands"] },
);

export const getCachedProductsByBrand = unstable_cache(
  (brandId: number, page: number, pageSize: number) =>
    getProductsByBrand(supabase, brandId, { page, pageSize }),
  ["products-by-brand"],
  { revalidate: 60, tags: ["products"] },
);
