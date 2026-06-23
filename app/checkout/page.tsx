import { createClient } from "@/lib/supabase-server";
import { getProfile } from "@/services/profile.service";
import CheckoutForm from "./CheckoutForm";

export const metadata = {
  title: "Оформление заказа — Aloe.kg",
};

export default async function CheckoutPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const initial = { name: "", phone: "", address: "" };

  if (user) {
    const profile = await getProfile(supabase, user.id);
    if (profile) {
      initial.name = profile.name ?? "";
      initial.phone = profile.phone ?? "";
      initial.address = profile.address ?? "";
    }
  }

  return (
    <main className="max-w-xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Оформление заказа</h1>
      <CheckoutForm initial={initial} />
    </main>
  );
}
