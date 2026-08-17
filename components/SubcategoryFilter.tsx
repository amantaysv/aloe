"use client";

import { useEffect } from "react";
import { useActiveSectionSync } from "@/hooks/useActiveSectionSync";
import { useDragScroll } from "@/hooks/useDragScroll";
import { useWindowScrolled } from "@/hooks/useWindowScrolled";
import { scrollToSection } from "@/lib/section-scroll";
import { containerClassname } from "./Container";

type Subcategory = { id: number; name: string; slug: string };

export default function SubcategoryFilter({ subcategories }: { subcategories: Subcategory[] }) {
  const { ref, handlers, onClickCapture } = useDragScroll<HTMLDivElement>();
  const { activeSectionId, pillRefs } = useActiveSectionSync(ref);
  const scrolled = useWindowScrolled();

  // Reflects the scrolled-to subcategory in the URL via the History API directly (not
  // next/navigation's router) so the address bar stays shareable/bookmarkable without
  // triggering a server re-render on every section change while scrolling.
  useEffect(() => {
    if (activeSectionId == null) return;
    const active = subcategories.find((s) => s.id === activeSectionId);
    if (!active) return;
    const params = new URLSearchParams(window.location.search);
    if (params.get("sub") === active.slug) return;
    params.set("sub", active.slug);
    window.history.replaceState(window.history.state, "", `?${params.toString()}`);
  }, [activeSectionId, subcategories]);

  if (subcategories.length === 0) return null;

  return (
    <div className="sticky top-15 md:top-41.5 z-10 bg-white">
      <div
        ref={ref}
        className={`${containerClassname} flex gap-2 py-2 ${scrolled ? "flex-nowrap overflow-x-auto" : "flex-wrap"}`}
        {...handlers}
        onClickCapture={onClickCapture}
      >
        {subcategories.map((s) => (
          <button
            key={s.id}
            ref={(el) => {
              if (el) pillRefs.current.set(s.id, el);
              else pillRefs.current.delete(s.id);
            }}
            onClick={() => scrollToSection(s.id)}
            aria-pressed={s.id === activeSectionId}
            className={`px-4 py-2 text-xs rounded-full border transition-colors whitespace-nowrap cursor-pointer ${
              s.id === activeSectionId
                ? "bg-gray-700 text-white border-gray-700"
                : "border-gray-300 text-gray-600 hover:bg-gray-50"
            }`}
          >
            {s.name}
          </button>
        ))}
      </div>
    </div>
  );
}
