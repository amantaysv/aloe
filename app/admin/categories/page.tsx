import { createClient } from "@/lib/supabase-server";
import { getAdminCategories } from "@/services/category.service";
import { getProductCategoryIds } from "@/services/product.service";
import AdminCategories from "../AdminCategories";

export default async function CategoriesPage() {
  const supabase = await createClient();
  const [categories, usedCategoryIds] = await Promise.all([
    getAdminCategories(supabase),
    getProductCategoryIds(supabase),
  ]);

  return (
    <AdminCategories
      categories={categories as Parameters<typeof AdminCategories>[0]["categories"]}
      usedCategoryIds={usedCategoryIds}
    />
  );
}
