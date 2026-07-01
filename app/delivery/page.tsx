import { DeliveryContent, MainContainer, MobileHeader, Title } from "@/components";

export const metadata = {
  title: "Доставка и оплата — Aloe.kg",
};

export default function DeliveryPage() {
  return (
    <>
      <MobileHeader title="Доставка и оплата" withBackButton />
      <MainContainer className="max-w-2xl">
        <Title className="hidden md:block mb-4">Доставка и оплата</Title>
        <DeliveryContent />
      </MainContainer>
    </>
  );
}
