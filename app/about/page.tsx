import { MobileHeader, Title } from "@/components";
import MainContainer from "@/components/MainContainer";

export const metadata = {
  title: "О нас — Aloe.kg",
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
