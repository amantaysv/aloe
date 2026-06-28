"use client";

import { SubmitEventHandler, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase-browser";
import { searchProductsAutocomplete } from "@/services/product.service";
import SearchInput from "../SearchInput";
import AutocompleteDropdown, { type AutocompleteProduct } from "./AutocompleteDropdown";

export default function HeaderSearchInput() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<AutocompleteProduct[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const searchRef = useRef<HTMLFormElement>(null);
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(
      async () => {
        if (query.length < 2) {
          setResults([]);
          setOpen(false);
          return;
        }
        setLoading(true);
        const data = await searchProductsAutocomplete(createClient(), query);
        setResults(data as AutocompleteProduct[]);
        setOpen(true);
        setLoading(false);
      },
      query.length < 2 ? 0 : 300,
    );
    return () => clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    function handleOutsideClick(e: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  const handleSubmit: SubmitEventHandler<HTMLFormElement> = (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    setOpen(false);
    setQuery("");
    router.push(`/search?q=${encodeURIComponent(query.trim())}`);
  };

  return (
    <form ref={searchRef} onSubmit={handleSubmit} className="relative flex flex-1">
      <SearchInput
        searchPath="/search"
        value={query}
        onChange={setQuery}
        inputProps={{
          onFocus: () => {
            if (results.length > 0 && query.length > 0) setOpen(true);
          },
        }}
      />

      {open && (
        <AutocompleteDropdown
          results={results}
          loading={loading}
          onSelect={() => {
            setOpen(false);
            setQuery("");
          }}
        />
      )}
    </form>
  );
}
