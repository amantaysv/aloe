"use client";

import { useRef, useState } from "react";

export function useDragScroll<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [isDown, setIsDown] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const [hasDragged, setHasDragged] = useState(false);

  function onMouseDown(e: React.MouseEvent) {
    setIsDown(true);
    setHasDragged(false);
    setStartX(e.pageX - (ref.current?.offsetLeft ?? 0));
    setScrollLeft(ref.current?.scrollLeft ?? 0);
  }

  function onMouseMove(e: React.MouseEvent) {
    if (!isDown || !ref.current) return;
    e.preventDefault();
    const x = e.pageX - ref.current.offsetLeft;
    const walk = x - startX;
    if (Math.abs(walk) > 5) setHasDragged(true);
    ref.current.scrollLeft = scrollLeft - walk;
  }

  function onMouseUp() {
    setIsDown(false);
  }

  function onClickCapture(e: React.MouseEvent) {
    if (hasDragged) {
      e.preventDefault();
      e.stopPropagation();
    }
  }

  return {
    ref,
    handlers: { onMouseDown, onMouseMove, onMouseUp, onMouseLeave: onMouseUp },
    onClickCapture,
  };
}
