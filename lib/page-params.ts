import type { SortValue } from "@/components/SortSelect";

export function parsePage(page?: string): number {
  return Math.max(1, parseInt(page ?? "1"));
}

export function parseSortParam(sort?: string): SortValue {
  const s = (sort ?? "name") as SortValue;
  return (["name", "price_asc", "price_desc"] as SortValue[]).includes(s) ? s : "name";
}

export function parseBrandIds(brand?: string | string[]): number[] {
  if (!brand) return [];
  return (Array.isArray(brand) ? brand : [brand]).map(Number);
}
