import type { Product } from "@/types";

/**
 * Builds one `VirtualCategoryContent` section per subcategory: products assigned to a
 * sub-subcategory are grouped under it (rendered with their own sub-heading), products assigned
 * directly to the subcategory land in `products` (rendered under the subcategory heading, no
 * sub-heading). When there are no sub-subcategories, `groups` is empty and everything is in
 * `products` — the original flat behavior.
 */
export function buildCategorySection(
  subcategory: { id: number; name: string },
  subSubcategories: { id: number; name: string }[],
  products: Product[],
): { id: number; name: string; products: Product[]; groups: { id: number; name: string; products: Product[] }[] } {
  if (subSubcategories.length === 0) {
    return { id: subcategory.id, name: subcategory.name, products, groups: [] };
  }

  const byId = new Map(subSubcategories.map((c) => [c.id, { id: c.id, name: c.name, products: [] as Product[] }]));
  const rest: Product[] = [];
  for (const p of products) {
    const bucket = byId.get(p.category_id);
    if (bucket) bucket.products.push(p);
    else rest.push(p);
  }

  const groups = subSubcategories.map((c) => byId.get(c.id)!).filter((g) => g.products.length > 0);
  return { id: subcategory.id, name: subcategory.name, products: rest, groups };
}
