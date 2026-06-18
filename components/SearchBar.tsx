"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import Image from "next/image";

type Product = {
  id: number;
  name: string;
  price: number;
  image_url: string;
  category_id: string;
};

export default function SearchBar() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    if (query.length < 2) {
      setResults([]);
      setOpen(false);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      const { data } = await supabase.from("products").select("id, name, price, image_url, category_id").ilike("name", `%${query}%`).limit(6);

      setResults(data || []);
      setOpen(true);
      setLoading(false);
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  // Закрыть при клике вне
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <div ref={ref} className="relative flex-1 max-w-xl">
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onFocus={() => {
          if (results.length > 0) setOpen(true);
        }}
        placeholder="Поиск товаров..."
        className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-green-500"
      />

      {loading && <div className="absolute right-3 top-2.5 text-gray-400 text-xs">...</div>}

      {open && results.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border rounded-lg shadow-lg z-50 overflow-hidden">
          {results.map((p) => (
            <button
              key={p.id}
              onClick={() => {
                router.push(`/catalog/${p.category_id}`);
                setOpen(false);
                setQuery("");
              }}
              className="w-full flex items-center gap-3 px-3 py-2 hover:bg-gray-50 text-left"
            >
              <div className="relative w-10 h-10 shrink-0 bg-gray-100 rounded">
                <Image src={p.image_url} alt={p.name} fill className="object-contain p-1" unoptimized />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm truncate">{p.name}</p>
                <p className="text-xs text-green-600 font-medium">{p.price} сом</p>
              </div>
            </button>
          ))}

          <button
            onClick={() => {
              router.push(`/search?q=${encodeURIComponent(query)}`);
              setOpen(false);
            }}
            className="w-full px-4 py-2 text-sm text-green-600 font-medium hover:bg-gray-50 border-t text-center"
          >
            Показать все результаты →
          </button>
        </div>
      )}

      {open && results.length === 0 && !loading && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border rounded-lg shadow-lg z-50 px-4 py-3 text-sm text-gray-500">Ничего не найдено</div>
      )}
    </div>
  );
}
