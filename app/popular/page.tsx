import { LabelProductsPage } from "@/components";

export const metadata = { title: "Популярные товары — Aloe.kg" };

export default async function PopularPage({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
  const { page = "1" } = await searchParams;
  return (
    <LabelProductsPage
      label="popular"
      title="Популярные товары"
      basePath="/popular"
      page={Math.max(1, parseInt(page))}
    />
  );
}
