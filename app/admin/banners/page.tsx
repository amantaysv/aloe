import { requireAdmin } from "@/lib/auth";
import { getAllBanners } from "@/services/banner.service";
import AdminBannersTabbed from "../AdminBannersTabbed";

export default async function BannersPage() {
  const { db: supabase } = await requireAdmin();
  const [desktopBanners, mobileBanners] = await Promise.all([
    getAllBanners(supabase, "desktop"),
    getAllBanners(supabase, "mobile"),
  ]);

  return <AdminBannersTabbed desktopBanners={desktopBanners} mobileBanners={mobileBanners} />;
}
