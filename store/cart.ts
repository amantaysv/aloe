import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  clearCart,
  deleteCartItem,
  loadCart,
  reconcileCartItems,
  upsertCartItem,
} from "@/services/cart.service";

type CartItem = {
  id: number;
  name: string;
  price: number;
  image_url: string;
  quantity: number;
};

type CartStore = {
  items: CartItem[];
  userId: string | null;
  add: (item: Omit<CartItem, "quantity">) => void;
  remove: (id: number) => void;
  increment: (id: number) => void;
  decrement: (id: number) => void;
  clear: () => void;
  total: () => number;
  count: () => number;
  setUser: (userId: string | null) => Promise<void>;
};

async function getSupabase() {
  const { createClient } = await import("@/lib/supabase-browser");
  return createClient();
}

export const useCart = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      userId: null,

      add: (item) => {
        set((state) => {
          const exists = state.items.find((i) => i.id === item.id);
          if (exists) {
            return {
              items: state.items.map((i) => (i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i)),
            };
          }
          return { items: [...state.items, { ...item, quantity: 1 }] };
        });
        const { userId, items } = get();
        if (userId) {
          const updated = items.find((i) => i.id === item.id)!;
          getSupabase().then((sb) => upsertCartItem(sb, userId, item.id, updated.quantity));
        }
      },

      remove: (id) => {
        const { userId } = get();
        set((state) => ({ items: state.items.filter((i) => i.id !== id) }));
        if (userId) {
          getSupabase().then((sb) => deleteCartItem(sb, userId, id));
        }
      },

      increment: (id) => {
        set((state) => ({
          items: state.items.map((i) => (i.id === id ? { ...i, quantity: i.quantity + 1 } : i)),
        }));
        const { userId, items } = get();
        if (userId) {
          const updated = items.find((i) => i.id === id)!;
          getSupabase().then((sb) => upsertCartItem(sb, userId, id, updated.quantity));
        }
      },

      decrement: (id) => {
        const prev = get().items.find((i) => i.id === id);
        set((state) => ({
          items: state.items
            .map((i) => (i.id === id ? { ...i, quantity: i.quantity - 1 } : i))
            .filter((i) => i.quantity > 0),
        }));
        const { userId } = get();
        if (userId && prev) {
          if (prev.quantity <= 1) {
            getSupabase().then((sb) => deleteCartItem(sb, userId, id));
          } else {
            const updated = get().items.find((i) => i.id === id);
            if (updated) {
              getSupabase().then((sb) => upsertCartItem(sb, userId, id, updated.quantity));
            }
          }
        }
      },

      clear: () => {
        const { userId } = get();
        set({ items: [] });
        if (userId) {
          getSupabase().then((sb) => clearCart(sb, userId));
        }
      },

      total: () => get().items.reduce((sum, i) => sum + i.price * i.quantity, 0),
      count: () => get().items.reduce((sum, i) => sum + i.quantity, 0),

      setUser: async (userId) => {
        if (!userId) {
          set({ userId: null, items: [] });
          return;
        }

        set({ userId });

        const supabase = await getSupabase();
        const dbItems = await loadCart(supabase, userId);

        // Local items win on conflict, DB-only items are appended
        const localItems = get().items;
        const merged: CartItem[] = [...localItems];
        for (const dbItem of dbItems) {
          if (!merged.find((i) => i.id === dbItem.id)) {
            merged.push(dbItem);
          }
        }

        set({ items: merged });

        // Reconcile local-only items back to DB
        const localOnly = localItems.filter((li) => !dbItems.find((di) => di.id === li.id));
        if (localOnly.length > 0) {
          await reconcileCartItems(supabase, userId, localOnly);
        }
      },
    }),
    {
      name: "cart",
      partialize: (state) => ({ items: state.items }),
    },
  ),
);
