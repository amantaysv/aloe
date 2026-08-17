"use client";

import { useRef } from "react";

/**
 * Drag-to-scroll for a horizontal strip. All bookkeeping lives in refs: none of it affects
 * rendering, and holding it in state re-rendered the container and every pill on each mousedown
 * and on every mousemove that crossed the drag threshold.
 */
export function useDragScroll<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const isDown = useRef(false);
  const startX = useRef(0);
  const startScrollLeft = useRef(0);
  const hasDragged = useRef(false);

  function onMouseDown(e: React.MouseEvent) {
    isDown.current = true;
    hasDragged.current = false;
    startX.current = e.pageX - (ref.current?.offsetLeft ?? 0);
    startScrollLeft.current = ref.current?.scrollLeft ?? 0;
  }

  function onMouseMove(e: React.MouseEvent) {
    if (!isDown.current || !ref.current) return;
    e.preventDefault();
    const walk = e.pageX - ref.current.offsetLeft - startX.current;
    if (Math.abs(walk) > 5) hasDragged.current = true;
    ref.current.scrollLeft = startScrollLeft.current - walk;
  }

  function onMouseUp() {
    isDown.current = false;
  }

  /** Swallows the click that ends a drag, so dragging past a pill doesn't activate it. */
  function onClickCapture(e: React.MouseEvent) {
    if (hasDragged.current) {
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
