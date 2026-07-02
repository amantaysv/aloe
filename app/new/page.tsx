import { LabelProductsPage } from "@/components";

export const metadata = {
  title: "Новинки — Aloe.kg",
  description: "Новые товары в интернет-магазине Aloe.kg: свежие поступления бытовой химии и косметики.",
};

export default async function NewPage({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
  const { page = "1" } = await searchParams;
  return <LabelProductsPage label="new" title="Новинки" basePath="/new" page={Math.max(1, parseInt(page))} />;
}
