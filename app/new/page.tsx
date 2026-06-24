import LabelProductsPage from "@/components/LabelProductsPage";

export const metadata = { title: "Новинки — Aloe.kg" };

export default async function NewPage({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
  const { page = "1" } = await searchParams;
  return <LabelProductsPage label="new" title="Новинки" basePath="/new" page={Math.max(1, parseInt(page))} />;
}
