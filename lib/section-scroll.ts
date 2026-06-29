type ScrollFn = (sectionId: number) => void;
let _fn: ScrollFn | null = null;

export function registerSectionScroller(fn: ScrollFn): () => void {
  _fn = fn;
  return () => {
    _fn = null;
  };
}

export function scrollToSection(id: number): void {
  _fn?.(id);
}
