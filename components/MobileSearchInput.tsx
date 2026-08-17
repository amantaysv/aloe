"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import SearchInput, { SearchBarProps } from "./SearchInput";

type MobileSearchInputProps = Pick<SearchBarProps, "searchPath"> & {
  defaultValue?: string;
};

export default function MobileSearchInput({ searchPath, defaultValue = "" }: MobileSearchInputProps) {
  const [query, setQuery] = useState(defaultValue);
  /** The query the address bar currently reflects — the one thing worth tracking here. */
  const [urlQuery, setUrlQuery] = useState(defaultValue);
  const router = useRouter();

  // defaultValue changing means the URL moved on its own (back/forward, or a server navigation),
  // so follow it. Adjusting during render is React's documented way to react to a prop change;
  // an effect would cause a cascading re-render, and a `key` on the parent would remount the
  // field and lose focus mid-typing.
  if (urlQuery !== defaultValue) {
    setUrlQuery(defaultValue);
    setQuery(defaultValue);
  }

  // Two effects used to race here. On /search?q=foo the first pushed the URL the browser was
  // already on — an extra RSC round trip plus a duplicate history entry, so "back" needed two
  // presses. The second pushed searchPath whenever the field was empty, which also fired on
  // mount, and SearchInput's clear button pushes too, making that a second redundant push.
  // Comparing against urlQuery makes all three cases no-ops.
  useEffect(() => {
    const trimmed = query.trim();
    if (trimmed === urlQuery) return;

    const timer = setTimeout(() => {
      setUrlQuery(trimmed);
      router.push(trimmed ? `${searchPath}?q=${encodeURIComponent(trimmed)}` : searchPath);
    }, 300);

    return () => clearTimeout(timer);
  }, [query, urlQuery, router, searchPath]);

  return <SearchInput searchPath={searchPath} value={query} onChange={setQuery} loading={defaultValue !== query} />;
}
