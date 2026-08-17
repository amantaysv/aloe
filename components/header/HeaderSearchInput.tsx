"use client";

import { SubmitEventHandler, useCallback, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useOutsideClick } from "@/hooks/useOutsideClick";
import { useProductAutocomplete } from "@/hooks/useProductAutocomplete";
import { cn } from "@/lib/cn";
import SearchInput from "../SearchInput";
import AutocompleteDropdown from "./AutocompleteDropdown";

export default function HeaderSearchInput({ className }: { className?: string }) {
  const [query, setQuery] = useState("");
  // Remembering *which* query was dismissed keeps this derived: no effect syncing a boolean,
  // and typing further re-opens the dropdown on its own.
  const [dismissedFor, setDismissedFor] = useState<string | null>(null);
  const searchRef = useRef<HTMLFormElement>(null);
  const router = useRouter();

  const { results, loading } = useProductAutocomplete(query);

  const close = useCallback(() => setDismissedFor(query), [query]);
  useOutsideClick(searchRef, close);

  const open = query.length >= 2 && dismissedFor !== query;

  const handleSubmit: SubmitEventHandler<HTMLFormElement> = (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    setQuery("");
    router.push(`/search?q=${encodeURIComponent(query.trim())}`);
  };

  return (
    <form ref={searchRef} onSubmit={handleSubmit} className={cn("relative flex flex-1", className)}>
      <SearchInput searchPath="/search" value={query} onChange={setQuery} loading={loading} />

      {open && <AutocompleteDropdown results={results} loading={loading} onSelect={() => setQuery("")} />}
    </form>
  );
}
