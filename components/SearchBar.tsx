"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import Button from "@/components/Button";
import { createClient } from "@/lib/supabase-browser";
import { searchProductsAutocomplete } from "@/services/product.service";

type Product = {
  id: number;
  name: string;
  price: number;
  image_url: string;
  category_id: string;
};

export default function SearchBar({ defaultValue = "", withButton = false }: { defaultValue?: string; withButton?: boolean }) {
  const [query, setQuery] = useState(defaultValue);
  const [results, setResults] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    if (withButton || query.length < 2) {
      setResults([]);
      setOpen(false);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      const supabase = createClient();
      const data = await searchProductsAutocomplete(supabase, query);
      setResults(data as Product[]);
      setOpen(true);
      setLoading(false);
    }, 300);

    return () => clearTimeout(timer);
  }, [query, withButton]);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  function handleSubmit() {
    if (query.trim()) {
      setOpen(false);
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
    }
  }

  return (
    <div ref={ref} className="relative w-full">
      <div className={withButton ? "flex gap-2" : ""}>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => {
            if (!withButton && results.length > 0) setOpen(true);
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleSubmit();
          }}
          placeholder="Поиск товаров..."
          className="flex-1 w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-green-500"
        />

        {withButton && (
          <button
            onClick={handleSubmit}
            className="shrink-0 bg-green-600 hover:bg-green-700 text-white text-sm font-medium px-4 rounded-lg transition-colors"
          >
            Искать
          </button>
        )}
      </div>

      {!withButton && loading && <div className="absolute right-3 top-2.5 text-gray-400 text-xs">...</div>}

      {!withButton && open && results.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-50 overflow-hidden">
          {results.map((p) => (
            <Button
              key={p.id}
              onClick={() => {
                router.push(`/catalog/${p.category_id}`);
                setOpen(false);
                setQuery("");
              }}
              className="w-full flex items-center gap-3 px-3 py-2 hover:bg-gray-50 text-left"
            >
              <div className="relative w-10 h-10 shrink-0 bg-gray-100 rounded">
                <Image src={p.image_url} alt={p.name} fill className="object-contain p-1" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm truncate">{p.name}</p>
                <p className="text-xs text-green-600 font-medium">{p.price} сом</p>
              </div>
            </Button>
          ))}

          <Button
            onClick={() => {
              router.push(`/search?q=${encodeURIComponent(query)}`);
              setOpen(false);
            }}
            variant="ghost"
            className="w-full px-4 py-2 text-sm font-medium hover:bg-gray-50 border-t border-gray-300 text-center"
          >
            Показать все результаты →
          </Button>
        </div>
      )}

      {!withButton && open && results.length === 0 && !loading && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-50 px-4 py-3 text-sm text-gray-500">
          Ничего не найдено
        </div>
      )}
    </div>
  );
}
