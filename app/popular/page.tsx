import { LabelProductsPage } from "@/components";
import { parsePage } from "@/lib/page-params";

export const metadata = {
  title: "Популярные товары — Aloe.kg",
  description: "Самые популярные товары в интернет-магазине Aloe.kg по количеству покупок.",
};

export default async function PopularPage({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
  const { page } = await searchParams;
  return <LabelProductsPage label="popular" title="Популярные товары" basePath="/popular" page={parsePage(page)} />;
}
