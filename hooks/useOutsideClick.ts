"use client";

import { useEffect, type RefObject } from "react";

/** Calls `onOutside` when a mousedown lands outside `ref`. No-op while `active` is false. */
export function useOutsideClick(ref: RefObject<HTMLElement | null>, onOutside: () => void, active = true) {
  useEffect(() => {
    if (!active) return;

    function handle(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) onOutside();
    }
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, [ref, onOutside, active]);
}
