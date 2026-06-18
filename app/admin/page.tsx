import { notFound } from "next/navigation";

import { createClient } from "@/lib/supabase-server";

import AdminOrders from "./AdminOrders";

export const metadata = { title: "Заказы — Админ" };

const ADMIN_EMAIL = "amantay.sv@gmail.com";

export default async function AdminPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || user.email !== ADMIN_EMAIL) notFound();

  const { data: orders } = await supabase.from("orders").select("*").order("created_at", { ascending: false });

  return (
    <main className="max-w-5xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Заказы</h1>
        <p className="text-sm text-gray-500">Всего: {orders?.length ?? 0}</p>
      </div>

      <AdminOrders orders={(orders ?? []) as Parameters<typeof AdminOrders>[0]["orders"]} />
    </main>
  );
}
