"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";

type Subcategory = { id: number; name: string; slug: string };

export default function SubcategoryFilter({
  subcategories,
  categorySlug,
  activeSubSlug,
}: {
  subcategories: Subcategory[];
  categorySlug: string;
  activeSubSlug?: string;
}) {
  const searchParams = useSearchParams();

  if (subcategories.length === 0) return null;

  const sortParam = searchParams.get("sort");
  const queryString = sortParam ? `?sort=${sortParam}` : "";

  return (
    <div className="flex flex-wrap gap-2 mb-6">
      <Link
        href={`/catalog/${categorySlug}${queryString}`}
        className={`px-3 py-1 text-xs rounded-full border transition-colors ${
          !activeSubSlug
            ? "bg-green-600 border-green-600 text-white"
            : "border-gray-300 text-gray-600 hover:border-green-500 hover:text-green-600"
        }`}
      >
        Все
      </Link>
      {subcategories.map((s) => {
        const active = s.slug === activeSubSlug;
        return (
          <Link
            key={s.id}
            href={`/catalog/${categorySlug}/${s.slug}${queryString}`}
            className={`px-3 py-1 text-xs rounded-full border transition-colors ${
              active
                ? "bg-green-600 border-green-600 text-white"
                : "border-gray-300 text-gray-600 hover:border-green-500 hover:text-green-600"
            }`}
          >
            {s.name}
          </Link>
        );
      })}
    </div>
  );
}
