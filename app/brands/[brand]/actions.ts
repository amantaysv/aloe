"use server";

import { getCachedProductsByBrand } from "@/lib/cached-queries";
import { rateLimit } from "@/lib/rate-limit";

const MAX_PAGE_SIZE = 48;
const MAX_PAGE = 10_000;

/**
 * Public POST endpoint — anyone can call it with any arguments. Unclamped, `pageSize` would
 * dump the whole catalog in one request and mint a separate data-cache entry per triple.
 */
export async function loadMoreBrandProducts(brandId: number, page: number, pageSize: number) {
  const id = Math.trunc(Number(brandId));
  if (!Number.isInteger(id) || id <= 0) return { products: [], total: 0 };

  // Infinite scroll fires this legitimately as the visitor scrolls, so the ceiling is generous.
  const { allowed } = await rateLimit("load-more-brand", { limit: 120, windowSeconds: 60 });
  if (!allowed) return { products: [], total: 0 };

  const safePage = Math.min(Math.max(1, Math.trunc(Number(page)) || 1), MAX_PAGE);
  const safePageSize = Math.min(Math.max(1, Math.trunc(Number(pageSize)) || 1), MAX_PAGE_SIZE);

  return getCachedProductsByBrand(id, safePage, safePageSize);
}
