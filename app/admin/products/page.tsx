import { createClient } from "@/lib/supabase-server";
import { getAdminCategories } from "@/services/category.service";
import { getAdminProducts, type AdminProductsSort } from "@/services/product.service";
import AdminProducts from "../AdminProducts";

const PAGE_SIZE = 20;

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const supabase = await createClient();
  const sp = await searchParams;

  const currentPage = Math.max(1, parseInt(sp.page ?? "1") || 1);
  const q = sp.q ?? "";
  const label = sp.label ?? "";
  const published = sp.published ?? "";
  const sort = (sp.sort ?? "id-desc") as AdminProductsSort;

  const [{ products, total }, allCategories] = await Promise.all([
    getAdminProducts(supabase, { q, label, published, sort, page: currentPage, pageSize: PAGE_SIZE }),
    getAdminCategories(supabase),
  ]);

  const totalPages = Math.ceil(total / PAGE_SIZE);

  // Products may only be assigned to "leaf" categories (a subcategory or sub-subcategory with
  // no children of its own) — top-level categories and categories that have sub-subcategories
  // are just organizational nodes, not something a product should link to directly.
  const byId = new Map(allCategories.map((c) => [c.id, c]));
  const hasChildren = new Set(allCategories.filter((c) => c.parent_id).map((c) => c.parent_id));
  const categories = allCategories
    .filter((c) => c.parent_id && !hasChildren.has(c.id))
    .map((c) => {
      const path: string[] = [];
      let node: typeof c | undefined = c;
      while (node) {
        path.unshift(node.name);
        node = node.parent_id ? byId.get(node.parent_id) : undefined;
      }
      return { id: c.id, name: c.name, path: path.join(" / ") };
    });

  return (
    <AdminProducts
      products={products as Parameters<typeof AdminProducts>[0]["products"]}
      page={currentPage}
      totalPages={totalPages}
      total={total}
      q={q}
      label={label}
      published={published}
      sort={sort}
      categories={categories as Parameters<typeof AdminProducts>[0]["categories"]}
    />
  );
}
