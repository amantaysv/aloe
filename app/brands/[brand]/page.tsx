import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Breadcrumb from "@/components/Breadcrumb";
import CatalogTitleWithCount from "@/components/CatalogTitleWithCount";
import Pagination from "@/components/Pagination";
import ProductCard from "@/components/ProductCard";
import ProductGrid from "@/components/ProductGrid";
import { getCachedBrandBySlug, getCachedProductsByBrand } from "@/lib/cached-queries";

const PAGE_SIZE = 24;

export async function generateMetadata({ params }: { params: Promise<{ brand: string }> }): Promise<Metadata> {
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

  const { products: rawProducts, total } = await getCachedProductsByBrand(brandData.id, currentPage, PAGE_SIZE);

  if (!total && currentPage === 1) notFound();

  const data = rawProducts.map((p) => ({ ...p, brand_name: brandData.name }));
  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <main className="max-w-6xl mx-auto px-4 py-8">
      <Breadcrumb
        crumbs={[{ label: "Главная", href: "/" }, { label: "Бренды", href: "/brands" }, { label: brandData.name }]}
      />

      <CatalogTitleWithCount title={brandData.name} count={total} />

      <ProductGrid>
        {data.map((product, i) => (
          <ProductCard key={product.id} product={product} priority={i === 0} />
        ))}
      </ProductGrid>

      <Pagination page={currentPage} totalPages={totalPages} basePath={`/brands/${brand}`} />
    </main>
  );
}
