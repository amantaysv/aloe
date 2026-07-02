import { cache } from "react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  AddToCart,
  Breadcrumb,
  Currency,
  FavoriteButton,
  MainContainer,
  ProductCard,
  ProductDescription,
  Title,
} from "@/components";
import { getCachedCategoriesWithSlug } from "@/lib/cached-queries";
import { LABEL_MAP } from "@/lib/constants";
import { supabase } from "@/lib/supabase";
import { getProduct, getRelatedProducts } from "@/services/product.service";
import type { ProductRow } from "@/types";
import { withBrandName } from "@/types";

const getCachedProduct = cache((id: string) => getProduct(supabase, id));

export const revalidate = 60;

export async function generateStaticParams() {
  const { data } = await supabase
    .from("products")
    .select("id")
    .eq("published", true)
    .order("created_at", { ascending: false })
    .limit(100);
  return (data ?? []).map((p) => ({ id: String(p.id) }));
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const { data: product } = await getCachedProduct(id);
  if (!product) return {};
  const seo = product.seo_text || product.name;
  return {
    title: seo,
    description: seo,
    keywords: seo,
    other: { title: seo },
  };
}

export default async function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const { data: rawProduct } = await getCachedProduct(id);

  if (!rawProduct) notFound();

  const brandInfo = (rawProduct as unknown as { brands?: { name: string; slug: string } | null }).brands;
  const product = withBrandName([rawProduct as unknown as ProductRow])[0];

  const [related, allCategories] = await Promise.all([
    getRelatedProducts(supabase, String(product.category_id), id),
    getCachedCategoriesWithSlug(),
  ]);

  const productCategory = allCategories?.find((c) => c.id === product.category_id);
  const parentCategory = productCategory?.parent_id
    ? allCategories?.find((c) => c.id === productCategory.parent_id)
    : null;

  const catalogHref = parentCategory
    ? `/catalog/${parentCategory.slug}/${productCategory?.slug}`
    : `/catalog/${product.category_id}`;

  const breadcrumbs = parentCategory
    ? [
        { label: "Главная", href: "/" },
        { label: parentCategory.name, href: `/catalog/${parentCategory.slug}` },
        { label: productCategory?.name, href: catalogHref },
        { label: product.name },
      ]
    : [
        { label: "Главная", href: "/" },
        { label: productCategory?.name ?? product.category, href: catalogHref },
        { label: product.name },
      ];

  const label = product.label ? LABEL_MAP[product.label as keyof typeof LABEL_MAP] : null;
  const discount =
    product.old_price && product.old_price > product.price
      ? Math.round(((product.old_price - product.price) / product.old_price) * 100)
      : null;

  return (
    <MainContainer className="pt-4">
      <Breadcrumb crumbs={breadcrumbs} />

      <div className="grid md:grid-cols-2 gap-8 mb-12">
        <div className="relative aspect-square bg-gray-50 rounded-xl overflow-hidden">
          <Image
            src={product.image_url}
            alt={product.name}
            fill
            className="object-contain p-6"
            priority
            sizes="(max-width: 768px) 100vw, 50vw"
          />
          {label && (
            <div className="absolute top-3 left-3">
              <span className={`${label.cls} text-white text-xs font-semibold px-2 py-1 rounded`}>{label.text}</span>
            </div>
          )}
          {discount && (
            <div className="absolute top-3 right-12">
              <span className="bg-red-500 text-white text-xs font-semibold px-2 py-1 rounded">−{discount}%</span>
            </div>
          )}
          <FavoriteButton productId={product.id} />
        </div>

        <div className="flex flex-col">
          <Link href={catalogHref} className="text-sm text-green-600 hover:underline mb-2 w-fit">
            {product.category}
          </Link>

          <Title className="mb-2">{product.name}</Title>

          {brandInfo && (
            <p className="text-sm text-gray-500 mb-4">
              Производитель:{" "}
              <Link href={`/brands/${brandInfo.slug}`} className="text-green-600 hover:underline">
                {brandInfo.name}
              </Link>
            </p>
          )}

          <div className="flex items-baseline gap-3 mb-6">
            <span className="text-2xl md:text-3xl font-bold">
              {product.price} <Currency />
            </span>
            {product.old_price && (
              <span className="text-lg text-gray-400 line-through">
                {product.old_price} <Currency />
              </span>
            )}
          </div>

          <div className="mb-6">
            <AddToCart
              product={{
                id: product.id,
                name: product.name,
                price: product.price,
                image_url: product.image_url,
              }}
              size="lg"
            />
          </div>

          {product.description && <ProductDescription text={product.description} />}
        </div>
      </div>

      {related && related.length > 0 && (
        <section>
          <h2 className="text-xl font-bold mb-4">Похожие товары</h2>
          <div className="grid gap-4" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))" }}>
            {related.map((p) => (
              <ProductCard key={p.id} product={p} href={`/product/${p.id}`} />
            ))}
          </div>
        </section>
      )}
    </MainContainer>
  );
}
