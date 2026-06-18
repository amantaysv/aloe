"use client";

import { useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { Product } from "@/types";
import ProductCard from "./ProductCard";

export default function ProductCarousel({
  title,
  href: seeAllHref,
  products,
  visibleCount = 4,
}: {
  title: string;
  href?: string;
  products: Product[];
  visibleCount?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);

  // gap-3 = 0.75rem between cards
  const cardWidth = `calc((100% - ${visibleCount - 1} * 0.75rem) / ${visibleCount})`;

  const scroll = (dir: "left" | "right") => {
    if (!ref.current) return;
    const amount = ref.current.clientWidth;
    ref.current.scrollBy({
      left: dir === "right" ? amount : -amount,
      behavior: "smooth",
    });
  };

  return (
    <section className="mb-10">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-baseline gap-3">
          <h2 className="text-xl font-bold">{title}</h2>
          {seeAllHref && (
            <a href={seeAllHref} className="text-sm text-green-600 hover:underline">
              Смотреть все →
            </a>
          )}
        </div>
        <div className="flex gap-1">
          <button
            onClick={() => scroll("left")}
            className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center text-gray-500 hover:border-green-600 hover:text-green-600 transition-colors hover:cursor-pointer"
            aria-label="Назад"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => scroll("right")}
            className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center text-gray-500 hover:border-green-600 hover:text-green-600 transition-colors hover:cursor-pointer"
            aria-label="Вперёд"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div ref={ref} className="flex gap-3 overflow-x-auto scrollbar-hide pb-1">
        {products.map((p) => (
          <div key={p.id} style={{ width: cardWidth }} className="shrink-0">
            <ProductCard product={p} className="h-full" />
          </div>
        ))}
      </div>
    </section>
  );
}
