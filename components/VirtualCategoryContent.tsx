"use client";

import React, { useEffect, useLayoutEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import { useWindowVirtualizer } from "@tanstack/react-virtual";
import { setActiveSection } from "@/lib/active-section";
import { registerSectionScroller } from "@/lib/section-scroll";
import type { Product } from "@/types";
import ProductCard from "./ProductCard";
import ProductGrid from "./ProductGrid";

type Section = {
  id: number;
  name: string;
  products: Product[];
};

type VirtualRow =
  | { type: "header"; name: string; first: boolean }
  | { type: "products"; items: Product[]; sectionIndex: number; rowIndex: number };

// 160px min item + 16px gap
const ITEM_WIDTH = 176;
const PRODUCT_ROW_HEIGHT = 300;
const HEADER_HEIGHT = 52;
const SECTION_GAP = 40;

function buildRows(sections: Section[], cols: number): VirtualRow[] {
  const rows: VirtualRow[] = [];
  sections.forEach(({ name, products }, si) => {
    rows.push({ type: "header", name, first: si === 0 });
    for (let i = 0; i < products.length; i += cols) {
      rows.push({
        type: "products",
        items: products.slice(i, i + cols),
        sectionIndex: si,
        rowIndex: Math.floor(i / cols),
      });
    }
  });
  return rows;
}

function VirtualizedProducts({ sections }: { sections: Section[] }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [cols, setCols] = useState(3);

  useLayoutEffect(() => {
    const measure = () => {
      if (containerRef.current) {
        const w = containerRef.current.offsetWidth;
        setCols(Math.max(2, Math.floor((w + 16) / ITEM_WIDTH)));
      }
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  const rows = useMemo(() => buildRows(sections, cols), [sections, cols]);

  const virtualizer = useWindowVirtualizer({
    count: rows.length,
    estimateSize: (i) => {
      const row = rows[i];
      if (row.type === "header") return (row.first ? 0 : SECTION_GAP) + HEADER_HEIGHT;
      return PRODUCT_ROW_HEIGHT;
    },
    overscan: 3,
  });

  const sectionHeaderRows = useMemo(() => {
    const result: number[] = [];
    let rowIdx = 0;
    sections.forEach((s) => {
      result.push(rowIdx);
      rowIdx += 1 + Math.ceil(s.products.length / cols);
    });
    return result;
  }, [sections, cols]);

  useEffect(() => {
    const handleScroll = () => {
      if (!containerRef.current) return;
      const containerDocTop = containerRef.current.getBoundingClientRect().top + window.scrollY;
      const relPos = window.scrollY + 220 - containerDocTop;
      const measurements = (
        virtualizer as unknown as { getMeasurements: () => Array<{ start: number }> }
      ).getMeasurements();
      let activeIdx = 0;
      sectionHeaderRows.forEach((rowIdx, si) => {
        const start = measurements[rowIdx]?.start ?? Infinity;
        if (start <= relPos) activeIdx = si;
      });
      setActiveSection(sections[activeIdx]?.id ?? null);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => {
      window.removeEventListener("scroll", handleScroll);
      setActiveSection(null);
    };
    // virtualizer is a stable class instance — safe to omit from deps
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sections, sectionHeaderRows]);

  useEffect(() => {
    return registerSectionScroller((sectionId: number) => {
      if (!containerRef.current) return;
      const sectionIndex = sections.findIndex((s) => s.id === sectionId);
      if (sectionIndex < 0) return;

      let rowIdx = 0;
      for (let i = 0; i < sectionIndex; i++) {
        rowIdx += 1 + Math.ceil(sections[i].products.length / cols);
      }

      // Use actual measured positions from the virtualizer cache (falls back to
      // estimateSize for items not yet rendered). Add containerDocTop so the
      // calculation works regardless of how much header space the page has.
      const measurements = (
        virtualizer as unknown as { getMeasurements: () => Array<{ start: number }> }
      ).getMeasurements();
      const itemStart = measurements[rowIdx]?.start;
      if (itemStart == null) return;

      const containerDocTop = containerRef.current.getBoundingClientRect().top + window.scrollY;
      // 214px = desired viewport position of the section header (below the sticky bar)
      window.scrollTo({ top: Math.max(0, containerDocTop + itemStart - 214), behavior: "auto" });
    });
    // virtualizer is a stable class instance — safe to omit from deps
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sections, cols]);

  return (
    <div ref={containerRef} style={{ height: virtualizer.getTotalSize(), position: "relative" }}>
      {virtualizer.getVirtualItems().map((virtualItem) => {
        const row = rows[virtualItem.index];
        return (
          <div
            key={virtualItem.key}
            data-index={virtualItem.index}
            ref={virtualizer.measureElement}
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              transform: `translateY(${virtualItem.start}px)`,
            }}
          >
            {row.type === "header" ? (
              <h2
                className="text-lg font-semibold mb-4 text-center md:text-left"
                style={{ paddingTop: row.first ? 0 : SECTION_GAP }}
              >
                {row.name}
              </h2>
            ) : (
              <div className="grid gap-4 pb-4" style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}>
                {row.items.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    priority={row.sectionIndex === 0 && row.rowIndex === 0}
                  />
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

const _noop = () => () => {};

// useSyncExternalStore: server snapshot = false, client snapshot = true.
// No setState in effects — avoids the cascading-render lint error.
const useIsClient = () =>
  useSyncExternalStore(
    _noop,
    () => true,
    () => false,
  );

export default function VirtualCategoryContent({ sections }: { sections: Section[] }) {
  const isClient = useIsClient();

  if (!isClient) {
    return sections.map(({ id, name, products }) => (
      <React.Fragment key={id}>
        <h2 className="text-lg font-semibold mb-4 text-center md:text-left">{name}</h2>
        <ProductGrid>
          {products.map((product, i) => (
            <ProductCard key={product.id} product={product} priority={i === 0} />
          ))}
        </ProductGrid>
      </React.Fragment>
    ));
  }

  return <VirtualizedProducts sections={sections} />;
}
