"use client";

import { useEffect } from "react";

/**
 * Ref-counted so overlapping overlays can't clobber each other. `DeliveryModal` sits in the
 * header on every desktop page and used to write `overflow = ""` on mount, releasing a lock the
 * intercepted product modal had taken.
 */
let locks = 0;
let previousOverflow = "";

export function useBodyScrollLock(locked: boolean) {
  useEffect(() => {
    if (!locked) return;

    if (locks === 0) {
      previousOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
    }
    locks++;

    return () => {
      locks--;
      if (locks === 0) document.body.style.overflow = previousOverflow;
    };
  }, [locked]);
}
