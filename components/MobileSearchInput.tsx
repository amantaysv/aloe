"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import SearchInput, { SearchBarProps } from "./SearchInput";

type MobileSearchInputProps = Pick<SearchBarProps, "searchPath"> & {
  defaultValue?: string;
};

export default function MobileSearchInput({ searchPath, defaultValue = "" }: MobileSearchInputProps) {
  const [query, setQuery] = useState(defaultValue);
  const router = useRouter();

  useEffect(() => {
    if (!query.trim()) return;
    const timer = setTimeout(async () => {
      router.push(`${searchPath}?q=${encodeURIComponent(query.trim())}`);
    }, 300);

    return () => clearTimeout(timer);
  }, [query, router, searchPath]);

  useEffect(() => {
    if (query.trim().length === 0) router.push(searchPath);
  }, [query, router, searchPath]);

  return <SearchInput searchPath={searchPath} value={query} onChange={setQuery} loading={defaultValue !== query} />;
}
