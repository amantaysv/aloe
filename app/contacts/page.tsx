import { MainContainer, MobileHeader, Title } from "@/components";

export const metadata = {
  title: "Контакты",
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
