"use client";

import React, { useLayoutEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import { useWindowVirtualizer } from "@tanstack/react-virtual";
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
              <div
                className="grid gap-4 pb-4"
                style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}
              >
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

// useSyncExternalStore: server snapshot = false, client snapshot = true.
// No setState in effects — avoids the cascading-render lint error.
const useIsClient = () =>
  useSyncExternalStore(
    () => () => {},
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
