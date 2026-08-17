import { requireAdmin } from "@/lib/auth";
import { getAdminCategories } from "@/services/category.service";
import { getProductCategoryIds } from "@/services/product.service";
import AdminCategories from "../AdminCategories";

export default async function CategoriesPage() {
  const { db: supabase } = await requireAdmin();
  const [categories, usedCategoryIds] = await Promise.all([
    getAdminCategories(supabase),
    getProductCategoryIds(supabase),
  ]);

  return <AdminCategories categories={categories} usedCategoryIds={usedCategoryIds} />;
}
