import { notFound } from "next/navigation";
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
    <main className="max-w-5xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Админ</h1>
      <AdminNav />
      {children}
    </main>
  );
}
