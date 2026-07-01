import { cache } from "react";
import Image from "next/image";
import { notFound } from "next/navigation";
import { AddToCart, Currency, FavoriteButton, ProductDescription } from "@/components";
import ProductModal from "@/components/ProductModal";
import { LABEL_MAP } from "@/lib/constants";
import { supabase } from "@/lib/supabase";
import { getProduct } from "@/services/product.service";
import type { ProductRow } from "@/types";
import { withBrandName } from "@/types";

const getCachedProduct = cache((id: string) => getProduct(supabase, id));

export default async function ProductModalPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const { data: rawProduct } = await getCachedProduct(id);

  if (!rawProduct) notFound();

  const brandInfo = (rawProduct as unknown as { brands?: { name: string; slug: string } | null }).brands;
  const product = withBrandName([rawProduct as unknown as ProductRow])[0];

  const label = product.label ? LABEL_MAP[product.label as keyof typeof LABEL_MAP] : null;
  const discount =
    product.old_price && product.old_price > product.price
      ? Math.round(((product.old_price - product.price) / product.old_price) * 100)
      : null;
  const productHref = `/product/${product.id}`;

  return (
    <ProductModal>
      <div className="grid sm:grid-cols-2 gap-6 p-4 sm:p-6">
        <div className="relative aspect-square bg-gray-50 rounded-xl overflow-hidden">
          <Image
            src={product.image_url}
            alt={product.name}
            fill
            className="object-contain p-6"
            sizes="(max-width: 640px) 100vw, 50vw"
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
          <a href={productHref} className="text-lg font-semibold mb-2 hover:underline w-fit">
            {product.name}
          </a>

          {brandInfo && <p className="text-sm text-gray-500 mb-4">Производитель: {brandInfo.name}</p>}

          <div className="flex items-baseline gap-3 mb-6">
            <span className="text-2xl font-bold">
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

          <a href={productHref} className="text-sm text-green-600 hover:underline mt-auto pt-4 w-fit">
            Открыть страницу товара →
          </a>
        </div>
      </div>
    </ProductModal>
  );
}
