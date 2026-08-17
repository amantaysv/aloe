import { LabelProductsPage } from "@/components";
import { parsePage } from "@/lib/page-params";

export const metadata = {
  title: "Новинки — Aloe.kg",
  description: "Новые товары в интернет-магазине Aloe.kg: свежие поступления бытовой химии и косметики.",
};

export default async function NewPage({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
  const { page } = await searchParams;
  return <LabelProductsPage label="new" title="Новинки" basePath="/new" page={parsePage(page)} />;
}
