import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Breadcrumb, MainContainer, Title } from "@/components";
import { getCachedBrandBySlug, getCachedProductsByBrand } from "@/lib/cached-queries";
import BrandProductsInfinite from "./BrandProductsInfinite";

const PAGE_SIZE = 24;

export async function generateMetadata({ params }: { params: Promise<{ brand: string }> }): Promise<Metadata> {
  const { brand } = await params;
  const data = await getCachedBrandBySlug(brand);
  if (!data) return {};
  return { title: `${data.name} — Бренды — Aloe.kg` };
}

export default async function BrandPage({ params }: { params: Promise<{ brand: string }> }) {
  const { brand } = await params;

  const brandData = await getCachedBrandBySlug(brand);

  if (!brandData) notFound();

  const { products: rawProducts, total } = await getCachedProductsByBrand(brandData.id, 1, PAGE_SIZE);

  if (!total) notFound();

  const data = rawProducts.map((p) => ({ ...p, brand_name: brandData.name }));

  return (
    <MainContainer>
      <Breadcrumb
        crumbs={[{ label: "Главная", href: "/" }, { label: "Бренды", href: "/brands" }, { label: brandData.name }]}
      />
      <Title className="mb-4 md:mb-6">{brandData.name}</Title>

      <BrandProductsInfinite
        key={brandData.id}
        brandId={brandData.id}
        brandName={brandData.name}
        pageSize={PAGE_SIZE}
        initialProducts={data}
        total={total}
      />
    </MainContainer>
  );
}
