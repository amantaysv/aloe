import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Breadcrumb from "@/components/Breadcrumb";
import Pagination from "@/components/Pagination";
import ProductCard from "@/components/ProductCard";
import { getCachedBrandBySlug, getCachedProductsByBrand } from "@/lib/cached-queries";

const PAGE_SIZE = 24;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ brand: string }>;
}): Promise<Metadata> {
  const { brand } = await params;
  const data = await getCachedBrandBySlug(brand);
  if (!data) return {};
  return { title: `${data.name} — Бренды — Aloe.kg` };
}

export default async function BrandPage({
  params,
  searchParams,
}: {
  params: Promise<{ brand: string }>;
  searchParams: Promise<{ page?: string }>;
}) {
  const [{ brand }, { page = "1" }] = await Promise.all([params, searchParams]);
  const currentPage = Math.max(1, parseInt(page));

  const brandData = await getCachedBrandBySlug(brand);

  if (!brandData) notFound();

  const { products: rawProducts, total } = await getCachedProductsByBrand(
    brandData.id,
    currentPage,
    PAGE_SIZE,
  );

  if (!total && currentPage === 1) notFound();

  const data = rawProducts.map((p) => ({ ...p, brand_name: brandData.name }));
  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <main className="max-w-6xl mx-auto px-4 py-8">
      <Breadcrumb
        crumbs={[
          { label: "Главная", href: "/" },
          { label: "Бренды", href: "/brands" },
          { label: brandData.name },
        ]}
      />

      <div className="flex items-baseline gap-3 mb-6">
        <h1 className="text-2xl font-bold">{brandData.name}</h1>
        <span className="text-sm text-gray-400">{total} товаров</span>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {data.map((product, i) => (
          <ProductCard key={product.id} product={product} priority={i === 0} />
        ))}
      </div>

      <Pagination page={currentPage} totalPages={totalPages} basePath={`/brands/${brand}`} />
    </main>
  );
}
