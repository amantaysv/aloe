import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase-server";

import CheckoutForm from "./CheckoutForm";

export const metadata = {
  title: "Оформление заказа — Aloe.kg",
};

export default async function CheckoutPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/auth");

  const { data: profile } = await supabase.from("profiles").select("name, phone, address").eq("id", user.id).single();

  const initial = {
    name: profile?.name ?? "",
    phone: profile?.phone ?? "",
    address: profile?.address ?? "",
  };

  return (
    <main className="max-w-xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Оформление заказа</h1>
      <CheckoutForm initial={initial} />
    </main>
  );
}
