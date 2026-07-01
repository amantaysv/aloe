import { MobileHeader, Title } from "@/components";
import MainContainer from "@/components/MainContainer";

export const metadata = {
  title: "Контакты — Aloe.kg",
};

export default function ContactsPage() {
  return (
    <>
      <MobileHeader title="Контакты" withBackButton />
      <MainContainer className="max-w-2xl">
        <Title className="hidden md:block mb-4">Контакты</Title>
      </MainContainer>
    </>
  );
}
