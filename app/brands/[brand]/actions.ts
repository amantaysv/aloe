"use server";

import { getCachedProductsByBrand } from "@/lib/cached-queries";

export async function loadMoreBrandProducts(brandId: number, page: number, pageSize: number) {
  return getCachedProductsByBrand(brandId, page, pageSize);
}
