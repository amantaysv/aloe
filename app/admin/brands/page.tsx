import { requireAdmin } from "@/lib/auth";
import { getBrands } from "@/services/brand.service";
import { getProductBrandIds } from "@/services/product.service";
import AdminBrands from "../AdminBrands";

export default async function BrandsPage() {
  const { db: supabase } = await requireAdmin();
  const [brands, usedBrandIds] = await Promise.all([getBrands(supabase), getProductBrandIds(supabase)]);

  return <AdminBrands brands={brands as Parameters<typeof AdminBrands>[0]["brands"]} usedBrandIds={usedBrandIds} />;
}
