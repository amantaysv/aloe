import { create } from "zustand";
import { persist } from "zustand/middleware";

type CartItem = {
  id: number;
  name: string;
  price: number;
  image_url: string;
  quantity: number;
};

type CartStore = {
  items: CartItem[];
  add: (item: Omit<CartItem, "quantity">) => void;
  remove: (id: number) => void;
  increment: (id: number) => void;
  decrement: (id: number) => void;
  clear: () => void;
  total: () => number;
  count: () => number;
};

export const useCart = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],

      add: (item) =>
        set((state) => {
          const exists = state.items.find((i) => i.id === item.id);
          if (exists) {
            return {
              items: state.items.map((i) => (i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i)),
            };
          }
          return {
            items: [...state.items, { ...item, quantity: 1 }],
          };
        }),

      remove: (id) =>
        set((state) => ({
          items: state.items.filter((i) => i.id !== id),
        })),

      increment: (id) =>
        set((state) => ({
          items: state.items.map((i) => (i.id === id ? { ...i, quantity: i.quantity + 1 } : i)),
        })),

      decrement: (id) =>
        set((state) => ({
          items: state.items
            .map((i) => (i.id === id ? { ...i, quantity: i.quantity - 1 } : i))
            .filter((i) => i.quantity > 0),
        })),

      clear: () => set({ items: [] }),

      total: () => get().items.reduce((sum, i) => sum + i.price * i.quantity, 0),

      count: () => get().items.reduce((sum, i) => sum + i.quantity, 0),
    }),
    { name: "cart" }
  )
);
