"use client";
import { useRef } from "react";

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
            className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center text-gray-500 hover:border-green-600 hover:text-green-600 transition-colors"
            aria-label="Назад"
          >
            <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
              <path
                fillRule="evenodd"
                d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z"
                clipRule="evenodd"
              />
            </svg>
          </button>
          <button
            onClick={() => scroll("right")}
            className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center text-gray-500 hover:border-green-600 hover:text-green-600 transition-colors"
            aria-label="Вперёд"
          >
            <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
              <path
                fillRule="evenodd"
                d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        </div>
      </div>

      <div ref={ref} className="flex gap-3 overflow-x-auto scrollbar-hide pb-1">
        {products.map((p) => (
          <div key={p.id} style={{ width: cardWidth }} className="shrink-0">
            <ProductCard product={p} href={`/catalog/${p.category_id}`} className="h-full" />
          </div>
        ))}
      </div>
    </section>
  );
}
