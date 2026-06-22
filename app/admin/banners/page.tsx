import { createClient } from "@/lib/supabase-server";
import AdminBanners from "../AdminBanners";

export default async function BannersPage() {
  const supabase = await createClient();
  const { data: banners } = await supabase.from("banners").select("*").order("sort_order");

  return (
    <AdminBanners
      banners={(banners ?? []) as Parameters<typeof AdminBanners>[0]["banners"]}
    />
  );
}
