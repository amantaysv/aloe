import { requireAdmin } from "@/lib/auth";
import { getCategories } from "@/services/category.service";
import { getProductCategoryIds } from "@/services/product.service";
import AdminCategories from "../AdminCategories";

export default async function CategoriesPage() {
  const { db: supabase } = await requireAdmin();
  const [categories, usedCategoryIds] = await Promise.all([getCategories(supabase), getProductCategoryIds(supabase)]);

  return <AdminCategories categories={categories} usedCategoryIds={usedCategoryIds} />;
}
