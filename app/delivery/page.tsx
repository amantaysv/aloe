import { Title } from "@/components";
import DeliveryContent from "@/components/DeliveryContent";
import MainContainer from "@/components/MainContainer";

export const metadata = {
  title: "Доставка и оплата — Aloe.kg",
};

export default function DeliveryPage() {
  return (
    <MainContainer className="max-w-2xl">
      <Title className="mb-4">Доставка и оплата</Title>
      <DeliveryContent />
    </MainContainer>
  );
}
