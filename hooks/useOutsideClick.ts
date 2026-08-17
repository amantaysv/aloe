"use client";

import { useEffect, useRef, type RefObject } from "react";

/** Calls `onOutside` when a mousedown lands outside `ref`. No-op while `active` is false. */
export function useOutsideClick(ref: RefObject<HTMLElement | null>, onOutside: () => void, active = true) {
  // Held in a ref so the callback can close over fresh state without `onOutside` sitting in the
  // deps — both call sites pass a useCallback keyed on their query, which re-registered the
  // document listener on every keystroke.
  const handler = useRef(onOutside);
  useEffect(() => {
    handler.current = onOutside;
  }, [onOutside]);

  useEffect(() => {
    if (!active) return;

    function handle(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) handler.current();
    }
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, [ref, active]);
}
