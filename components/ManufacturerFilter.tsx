"use client";

import { useCallback } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

type Brand = { id: number; name: string };

export default function ManufacturerFilter({
  manufacturers: brands,
  className = "mb-6",
}: {
  manufacturers: Brand[];
  className?: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const selected = searchParams.getAll("brand").map(Number);

  const toggle = useCallback(
    (id: number) => {
      const params = new URLSearchParams(searchParams.toString());
      params.delete("brand");
      params.delete("page");

      const next = selected.includes(id) ? selected.filter((b) => b !== id) : [...selected, id];
      next.forEach((b) => params.append("brand", String(b)));
      router.push(`${pathname}?${params.toString()}`);
    },
    [router, pathname, searchParams, selected],
  );

  const reset = useCallback(() => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("brand");
    params.delete("page");
    router.push(`${pathname}?${params.toString()}`);
  }, [router, pathname, searchParams]);

  if (brands.length === 0) return null;

  return (
    <div className={className}>
      <div className="flex items-center gap-3 mb-2">
        <span className="text-sm font-medium text-gray-700">Производитель</span>
        {selected.length > 0 && (
          <button onClick={reset} className="text-xs text-green-600 hover:underline">
            Сбросить
          </button>
        )}
      </div>
      <div className="flex flex-wrap gap-2">
        {brands.map((b) => {
          const active = selected.includes(b.id);
          return (
            <button
              key={b.id}
              onClick={() => toggle(b.id)}
              className={`px-3 py-1 text-xs rounded-full border transition-colors ${
                active
                  ? "bg-green-600 border-green-600 text-white"
                  : "border-gray-300 text-gray-600 hover:border-green-500 hover:text-green-600"
              }`}
            >
              {b.name}
            </button>
          );
        })}
      </div>
    </div>
  );
}
