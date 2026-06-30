import { Container } from "@/components";
import DeliveryContent from "@/components/DeliveryContent";

export const metadata = {
  title: "Доставка и оплата — Aloe.kg",
};

export default function DeliveryPage() {
  return (
    <Container className="max-w-2xl py-12">
      <h1 className="text-2xl font-semibold text-gray-900 mb-4">Доставка и оплата</h1>
      <DeliveryContent />
    </Container>
  );
}
