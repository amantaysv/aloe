"use client";
import { useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import AddToCart from "./AddToCart";
import FavoriteButton from "./FavoriteButton";
import type { Product } from "@/types";

export default function ProductCarousel({ title, products }: { title: string; products: Product[] }) {
  const ref = useRef<HTMLDivElement>(null);

  const scroll = (dir: "left" | "right") => {
    ref.current?.scrollBy({ left: dir === "right" ? 720 : -720, behavior: "smooth" });
  };

  return (
    <section className="mb-10">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-xl font-bold">{title}</h2>
        <div className="flex gap-1">
          <button
            onClick={() => scroll("left")}
            className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center text-gray-500 hover:border-green-600 hover:text-green-600 transition-colors"
            aria-label="Назад"
          >
            <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
              <path fillRule="evenodd" d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z" clipRule="evenodd" />
            </svg>
          </button>
          <button
            onClick={() => scroll("right")}
            className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center text-gray-500 hover:border-green-600 hover:text-green-600 transition-colors"
            aria-label="Вперёд"
          >
            <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
              <path fillRule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      </div>

      <div ref={ref} className="flex gap-3 overflow-x-auto scrollbar-hide pb-1">
        {products.map((p) => (
          <div key={p.id} className="shrink-0 w-44 border rounded-lg overflow-hidden hover:shadow-md transition-shadow bg-white">
            <Link href={`/catalog/${p.category_id}`}>
              <div className="relative aspect-square bg-gray-50">
                <Image src={p.image_url} alt={p.name} fill className="object-contain p-2" unoptimized />
                <FavoriteButton productId={p.id} />
              </div>
              <div className="p-2">
                <p className="text-[11px] text-gray-400 truncate">{p.category}</p>
                <p className="text-xs font-medium line-clamp-2 leading-4 mt-0.5 h-8">{p.name}</p>
                <p className="text-sm font-bold mt-1">{p.price} сом</p>
              </div>
            </Link>
            <div className="px-2 pb-2">
              <AddToCart product={{ id: p.id, name: p.name, price: p.price, image_url: p.image_url }} />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
