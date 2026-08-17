import { MainContainer, MobileHeader, Title } from "@/components";

export const metadata = {
  title: "О нас",
};

export default function AboutPage() {
  return (
    <>
      <MobileHeader title="О нас" withBackButton />
      <MainContainer className="max-w-2xl">
        <Title className="hidden md:block mb-4">О нас</Title>
      </MainContainer>
    </>
  );
}
