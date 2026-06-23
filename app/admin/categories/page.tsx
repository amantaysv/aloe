import { createClient } from "@/lib/supabase-server";
import AdminCategories from "../AdminCategories";

export default async function CategoriesPage() {
  const supabase = await createClient();
  const [{ data: categories }, { data: catIds }] = await Promise.all([
    supabase.from("categories").select("*").order("name"),
    supabase.from("products").select("category_id").not("category_id", "is", null),
  ]);

  const usedCategoryIds = [...new Set((catIds ?? []).map((p) => p.category_id as number))];

  return (
    <AdminCategories
      categories={(categories ?? []) as Parameters<typeof AdminCategories>[0]["categories"]}
      usedCategoryIds={usedCategoryIds}
    />
  );
}
