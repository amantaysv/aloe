"use client";

import { useEffect, useState } from "react";

export function useWindowScrolled(threshold = 1) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > threshold);
    }
    // Without this initial read, a reload mid-page or a back-navigation leaves `scrolled`
    // false until the user scrolls — the subcategory bar renders in the wrong layout mode
    // and then snaps, which also costs CLS.
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [threshold]);

  return scrolled;
}
