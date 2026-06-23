import { createClient } from "@/lib/supabase-server";
import AdminBrands from "../AdminBrands";

export default async function BrandsPage() {
  const supabase = await createClient();
  const [{ data: brands }, { data: brandIds }] = await Promise.all([
    supabase.from("brands").select("id, name, slug").order("name"),
    supabase.from("products").select("brand_id").not("brand_id", "is", null),
  ]);

  const usedBrandIds = [...new Set((brandIds ?? []).map((p) => p.brand_id as number).filter(Boolean))];

  return (
    <AdminBrands
      brands={(brands ?? []) as Parameters<typeof AdminBrands>[0]["brands"]}
      usedBrandIds={usedBrandIds}
    />
  );
}
