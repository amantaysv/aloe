import { notFound } from "next/navigation";
import { Container, Title } from "@/components";
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
    <Container>
      <Title className="mb-6">Админ</Title>
      <AdminNav />
      {children}
    </Container>
  );
}
