import { createClient } from "@/lib/supabase-server";
import { getAllBanners } from "@/services/banner.service";
import AdminBanners from "../AdminBanners";

export default async function BannersPage() {
  const supabase = await createClient();
  const banners = await getAllBanners(supabase);

  return <AdminBanners banners={banners as Parameters<typeof AdminBanners>[0]["banners"]} />;
}
