import { LabelProductsPage } from "@/components";

export const metadata = {
  title: "Акции — Aloe.kg",
  description: "Товары со скидкой в интернет-магазине Aloe.kg: бытовая химия и косметика по акционным ценам.",
};

export default async function SalePage({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
  const { page = "1" } = await searchParams;
  return (
    <LabelProductsPage
      label="sale"
      title="Акции"
      basePath="/sale"
      emptyText="Акций нет"
      page={Math.max(1, parseInt(page))}
    />
  );
}
