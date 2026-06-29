"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { scrollToSection } from "@/lib/section-scroll";

type Subcategory = { id: number; name: string; slug: string };

export default function SubcategoryFilter({
  subcategories,
  categorySlug,
  activeSubSlug,
  scrollMode,
}: {
  subcategories: Subcategory[];
  categorySlug?: string;
  activeSubSlug?: string;
  scrollMode?: boolean;
}) {
  const searchParams = useSearchParams();

  if (subcategories.length === 0) return null;

  const sortParam = searchParams.get("sort");
  const queryString = sortParam ? `?sort=${sortParam}` : "";

  return (
    <div className="sticky top-[166px] z-10 bg-white">
      <div className="container mx-auto flex flex-wrap gap-2 py-2">
        {subcategories.map((s) => {
          if (scrollMode) {
            return (
              <button
                key={s.id}
                onClick={() => scrollToSection(s.id)}
                className="px-4 py-2 text-xs rounded-full border border-gray-300 text-gray-600 transition-colors hover:bg-gray-50"
              >
                {s.name}
              </button>
            );
          }
          const active = s.slug === activeSubSlug;
          return (
            <Link
              key={s.id}
              href={`/catalog/${categorySlug}/${s.slug}${queryString}`}
              className={`px-4 py-2 text-xs rounded-full border transition-colors ${
                active ? "bg-gray-700 text-white" : "border-gray-300 text-gray-600"
              }`}
            >
              {s.name}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
