import { MobileHeader, Title } from "@/components";
import MainContainer from "@/components/MainContainer";
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
    <>
      <MobileHeader title="Оформление заказа" withBackButton />
      <MainContainer className="max-w-xl">
        <Title className="hidden md:block mb-4 md:mb-6">Оформление заказа</Title>
        <CheckoutForm initial={initial} />
      </MainContainer>
    </>
  );
}
