"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { subscribeActiveSection } from "@/lib/active-section";
import { scrollToSection } from "@/lib/section-scroll";
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
  const [activeSectionId, setActiveSectionId] = useState<number | null>(null);

  const ref = useRef<HTMLDivElement>(null);
  const pillRefs = useRef<Map<number, HTMLButtonElement>>(new Map());
  const [isDown, setIsDown] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const [hasDragged, setHasDragged] = useState(false);

  function onMouseDown(e: React.MouseEvent) {
    setIsDown(true);
    setHasDragged(false);
    setStartX(e.pageX - (ref.current?.offsetLeft || 0));
    setScrollLeft(ref.current?.scrollLeft || 0);
  }

  function onMouseMove(e: React.MouseEvent) {
    if (!isDown || !ref.current) return;
    e.preventDefault();
    const x = e.pageX - ref.current.offsetLeft;
    const walk = x - startX;
    if (Math.abs(walk) > 5) setHasDragged(true);
    ref.current.scrollLeft = scrollLeft - walk;
  }

  function onClickCapture(e: React.MouseEvent) {
    if (hasDragged) {
      e.preventDefault();
      e.stopPropagation();
    }
  }

  useEffect(() => {
    if (!scrollMode) return;
    return subscribeActiveSection((id) => {
      setActiveSectionId(id);
      if (id === null) return;
      const pill = pillRefs.current.get(id);
      if (pill && ref.current) {
        const container = ref.current;
        const pillLeft = pill.offsetLeft;
        const pillRight = pillLeft + pill.offsetWidth;
        const viewLeft = container.scrollLeft;
        const viewRight = viewLeft + container.offsetWidth;
        if (pillLeft < viewLeft || pillRight > viewRight) {
          container.scrollTo({ left: pillLeft - container.offsetWidth / 2 + pill.offsetWidth / 2, behavior: "smooth" });
        }
      }
    });
  }, [scrollMode]);

  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 1); // порог в пикселях
    }
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (subcategories.length === 0) return null;

  const sortParam = searchParams.get("sort");
  const queryString = sortParam ? `?sort=${sortParam}` : "";

  return (
    <div className="sticky top-41.5 right-0 left-0 z-10 bg-white">
      <div
        ref={ref}
        className={`${containerClassname} flex gap-2 py-2 ${scrolled ? "flex-nowrap overflow-x-auto" : "flex-wrap"}`}
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={() => setIsDown(false)}
        onMouseLeave={() => setIsDown(false)}
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
