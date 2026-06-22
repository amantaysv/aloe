"use client";

import useEmblaCarousel from "embla-carousel-react";
import type { Product } from "@/types";
import ProductCard from "./ProductCard";

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
    <section className="mb-10">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-xl font-bold">{title}</h2>
        {hiddenCount > 0 && seeAllHref && (
          <a href={seeAllHref} className="text-sm text-gray-400 hover:text-green-600 transition-colors">
            +{hiddenCount} ещё
          </a>
        )}
      </div>

      <div ref={emblaRef} className="overflow-hidden">
        <div className="flex gap-3">
          {products.map((p, i) => (
            <div
              key={p.id}
              className="shrink-0"
              style={{ width: `calc((100% - ${visibleCount - 1} * 0.75rem) / ${visibleCount})` }}
            >
              <ProductCard product={p} className="h-full" priority={i === 0} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
