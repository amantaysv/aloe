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

  const [{ products, total }, categories] = await Promise.all([
    getAdminProducts(supabase, { q, label, published, sort, page: currentPage, pageSize: PAGE_SIZE }),
    getAdminCategories(supabase),
  ]);

  const totalPages = Math.ceil(total / PAGE_SIZE);

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
