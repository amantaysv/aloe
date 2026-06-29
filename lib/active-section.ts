type Listener = (id: number | null) => void;
const listeners = new Set<Listener>();
let current: number | null = null;

export function setActiveSection(id: number | null) {
  if (current === id) return;
  current = id;
  listeners.forEach((fn) => fn(id));
}

export function subscribeActiveSection(fn: Listener): () => void {
  listeners.add(fn);
  fn(current);
  return () => {
    listeners.delete(fn);
  };
}
