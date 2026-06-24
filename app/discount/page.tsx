import LabelProductsPage from "@/components/LabelProductsPage";

export const metadata = { title: "Скидки — Aloe.kg" };

export default async function DiscountPage({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
  const { page = "1" } = await searchParams;
  return <LabelProductsPage label="discount" title="Скидки" basePath="/discount" page={Math.max(1, parseInt(page))} />;
}
