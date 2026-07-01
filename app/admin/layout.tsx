import { notFound } from "next/navigation";
import { MobileHeader, Title } from "@/components";
import MainContainer from "@/components/MainContainer";
import { createClient } from "@/lib/supabase-server";
import AdminNav from "./AdminNav";

export const metadata = { title: "Админ" };

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user || user.app_metadata?.role !== "admin") notFound();

  return (
    <>
      <MobileHeader title="Админ" withGoToMainButton />
      <MainContainer>
        <Title className="hidden md:block mb-4 md:mb-6">Админ</Title>
        <AdminNav />
        {children}
      </MainContainer>
    </>
  );
}
