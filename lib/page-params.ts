import type { SortValue } from "@/components/SortSelect";

/** Guards against `?page=abc` — `Math.max(1, parseInt("abc"))` is NaN, which reaches `.range()`. */
const MAX_PAGE = 10_000;

export function parsePage(page?: string): number {
  const n = Number.parseInt(page ?? "1", 10);
  if (!Number.isFinite(n) || n < 1) return 1;
  return Math.min(n, MAX_PAGE);
}

export function parseSortParam(sort?: string): SortValue {
  const s = (sort ?? "name") as SortValue;
  return (["name", "price_asc", "price_desc"] as SortValue[]).includes(s) ? s : "name";
}

export function parseBrandIds(brand?: string | string[]): number[] {
  if (!brand) return [];
  return (Array.isArray(brand) ? brand : [brand]).map(Number).filter((id) => Number.isInteger(id) && id > 0);
}
