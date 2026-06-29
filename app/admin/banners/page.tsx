import { createClient } from "@/lib/supabase-server";
import { getAllBanners } from "@/services/banner.service";
import AdminBannersTabbed from "../AdminBannersTabbed";

export default async function BannersPage() {
  const supabase = await createClient();
  const [desktopBanners, mobileBanners] = await Promise.all([
    getAllBanners(supabase, "desktop"),
    getAllBanners(supabase, "mobile"),
  ]);

  return (
    <AdminBannersTabbed
      desktopBanners={desktopBanners as Parameters<typeof AdminBannersTabbed>[0]["desktopBanners"]}
      mobileBanners={mobileBanners as Parameters<typeof AdminBannersTabbed>[0]["mobileBanners"]}
    />
  );
}
