"use client";

import { useRef, useState } from "react";

type DragPos = { group: string | number; index: number };

/**
 * Drag-to-reorder within one or more groups (e.g. subcategories per parent). Only one item
 * can be dragged at a time; dropping into a different group than the drag started in is a no-op.
 */
export function useDragReorder() {
  const [dragOver, setDragOver] = useState<DragPos | null>(null);
  const dragRef = useRef<DragPos | null>(null);

  function onDragStart(group: DragPos["group"], index: number) {
    dragRef.current = { group, index };
  }

  function onDragOver(e: React.DragEvent, group: DragPos["group"], index: number) {
    e.preventDefault();
    setDragOver({ group, index });
  }

  function onDragLeave() {
    setDragOver(null);
  }

  function onDragEnd() {
    dragRef.current = null;
    setDragOver(null);
  }

  function onDrop<T>(group: DragPos["group"], items: T[], dropIndex: number): T[] | null {
    const drag = dragRef.current;
    dragRef.current = null;
    setDragOver(null);
    if (!drag || drag.group !== group || drag.index === dropIndex) return null;
    const next = [...items];
    const [moved] = next.splice(drag.index, 1);
    next.splice(dropIndex, 0, moved);
    return next;
  }

  function isOver(group: DragPos["group"], index: number) {
    return dragOver?.group === group && dragOver?.index === index;
  }

  return { onDragStart, onDragOver, onDragLeave, onDragEnd, onDrop, isOver };
}
