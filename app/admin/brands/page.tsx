import { createClient } from "@/lib/supabase-server";
import { getBrands } from "@/services/brand.service";
import { getProductBrandIds } from "@/services/product.service";
import AdminBrands from "../AdminBrands";

export default async function BrandsPage() {
  const supabase = await createClient();
  const [brands, usedBrandIds] = await Promise.all([
    getBrands(supabase),
    getProductBrandIds(supabase),
  ]);

  return (
    <AdminBrands
      brands={brands as Parameters<typeof AdminBrands>[0]["brands"]}
      usedBrandIds={usedBrandIds}
    />
  );
}
