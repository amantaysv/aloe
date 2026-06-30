"use client";

import useEmblaCarousel from "embla-carousel-react";
import type { Product } from "@/types";
import ProductCard from "./ProductCard";
import SeeAllProducts from "./SeeAllProducts";

export default function ProductCarousel({
  title,
  href: seeAllHref,
  products,
  totalCount,
  visibleCount = 4,
}: {
  title: string;
  href?: string;
  products: Product[];
  totalCount?: number;
  visibleCount?: number;
}) {
  const [emblaRef] = useEmblaCarousel({
    align: "start",
    dragFree: true,
    slidesToScroll: visibleCount,
  });

  const hiddenCount = Math.max(0, (totalCount ?? products.length) - visibleCount);

  return (
    <section>
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-xl font-bold">{title}</h2>
        {hiddenCount > 0 && seeAllHref && <SeeAllProducts href={seeAllHref} count={hiddenCount} />}
      </div>

      <div ref={emblaRef} className="overflow-hidden">
        <div className="grid grid-flow-col auto-cols-[minmax(160px,220px)] gap-3">
          {products.map((p, i) => (
            <div key={p.id}>
              <ProductCard product={p} className="h-full" priority={i === 0} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
