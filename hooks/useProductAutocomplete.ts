"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase-browser";
import { searchProductsAutocomplete } from "@/services/product.service";

type Suggestion = Awaited<ReturnType<typeof searchProductsAutocomplete>>[number];

const MIN_QUERY = 2;
const DEBOUNCE_MS = 300;

/**
 * Debounced product suggestions, previously implemented twice with the same race in both copies:
 * `clearTimeout` only cancels a timer that has not fired, so a slow reply for "шам" could
 * overwrite a fast one for "шампунь". The `cancelled` flag closes that.
 *
 * Results are stored alongside the query they belong to, so a caller can tell suggestions for the
 * current input from ones left over from a previous keystroke.
 */
export function useProductAutocomplete(query: string, limit?: number) {
  const [state, setState] = useState<{ query: string; items: Suggestion[] }>({ query: "", items: [] });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (query.length < MIN_QUERY) return;

    let cancelled = false;
    const timer = setTimeout(async () => {
      // Inside the timeout rather than the effect body: `loading` then reflects a request that is
      // actually in flight, not the debounce wait.
      setLoading(true);
      try {
        const items = await searchProductsAutocomplete(createClient(), query, limit);
        if (!cancelled) setState({ query, items });
      } finally {
        if (!cancelled) setLoading(false);
      }
    }, DEBOUNCE_MS);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [query, limit]);

  return {
    results: query.length < MIN_QUERY ? [] : state.items,
    /** True only while a request for the current input is in flight. */
    loading,
    /** Whether `results` were fetched for exactly the query passed in. */
    isCurrent: state.query === query,
  };
}
