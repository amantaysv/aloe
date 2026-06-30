"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { scrollToSection } from "@/lib/section-scroll";
import { useActiveSectionSync } from "@/hooks/useActiveSectionSync";
import { useDragScroll } from "@/hooks/useDragScroll";
import { useWindowScrolled } from "@/hooks/useWindowScrolled";
import { containerClassname } from "./Container";

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
  const { ref, handlers, onClickCapture } = useDragScroll<HTMLDivElement>();
  const { activeSectionId, pillRefs } = useActiveSectionSync(scrollMode, ref);
  const scrolled = useWindowScrolled();

  if (subcategories.length === 0) return null;

  const sortParam = searchParams.get("sort");
  const queryString = sortParam ? `?sort=${sortParam}` : "";

  return (
    <div className="sticky top-41.5 right-0 left-0 z-10 bg-white">
      <div
        ref={ref}
        className={`${containerClassname} flex gap-2 py-2 ${scrolled ? "flex-nowrap overflow-x-auto" : "flex-wrap"}`}
        {...handlers}
        onClickCapture={onClickCapture}
      >
        {subcategories.map((s) => {
          if (scrollMode) {
            return (
              <button
                key={s.id}
                ref={(el) => { if (el) pillRefs.current.set(s.id, el); else pillRefs.current.delete(s.id); }}
                onClick={() => scrollToSection(s.id)}
                className={`px-4 py-2 text-xs rounded-full border transition-colors whitespace-nowrap cursor-pointer ${
                  s.id === activeSectionId
                    ? "bg-gray-700 text-white border-gray-700"
                    : "border-gray-300 text-gray-600 hover:bg-gray-50"
                }`}
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
              className={`px-4 py-2 text-xs rounded-full border transition-colors whitespace-nowrap ${
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
