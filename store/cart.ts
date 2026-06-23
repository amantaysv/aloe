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

function upsertRow(userId: string, productId: number, quantity: number) {
  getSupabase()
    .then((sb) =>
      sb
        .from("cart_items")
        .upsert({ user_id: userId, product_id: productId, quantity }, { onConflict: "user_id,product_id" }),
    )
    .then(({ error }) => {
      if (error) console.error("[cart] upsert error:", error.message);
    });
}

function deleteRow(userId: string, productId: number) {
  getSupabase()
    .then((sb) => sb.from("cart_items").delete().eq("user_id", userId).eq("product_id", productId))
    .then(({ error }) => {
      if (error) console.error("[cart] delete error:", error.message);
    });
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
          upsertRow(userId, item.id, updated.quantity);
        }
      },

      remove: (id) => {
        const { userId } = get();
        set((state) => ({ items: state.items.filter((i) => i.id !== id) }));
        if (userId) deleteRow(userId, id);
      },

      increment: (id) => {
        set((state) => ({
          items: state.items.map((i) => (i.id === id ? { ...i, quantity: i.quantity + 1 } : i)),
        }));
        const { userId, items } = get();
        if (userId) {
          const updated = items.find((i) => i.id === id)!;
          upsertRow(userId, id, updated.quantity);
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
            deleteRow(userId, id);
          } else {
            const updated = get().items.find((i) => i.id === id);
            if (updated) upsertRow(userId, id, updated.quantity);
          }
        }
      },

      clear: () => {
        const { userId } = get();
        set({ items: [] });
        if (userId) {
          getSupabase()
            .then((sb) => sb.from("cart_items").delete().eq("user_id", userId))
            .then(({ error }) => {
              if (error) console.error("[cart] clear error:", error.message);
            });
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

        // Load cart from DB joined with products for name/price/image_url
        const { data, error } = await supabase
          .from("cart_items")
          .select("product_id, quantity, products(name, price, image_url)")
          .eq("user_id", userId);

        if (error) {
          console.error("[cart] load error:", error.message);
          return;
        }

        type Row = {
          product_id: number;
          quantity: number;
          products: { name: string; price: number; image_url: string } | null;
        };

        const dbItems: CartItem[] = (data as unknown as Row[])
          .filter((r) => r.products !== null)
          .map((r) => ({
            id: r.product_id,
            name: r.products!.name,
            price: r.products!.price,
            image_url: r.products!.image_url,
            quantity: r.quantity,
          }));

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
          const { error: upsertErr } = await supabase.from("cart_items").upsert(
            localOnly.map((i) => ({ user_id: userId, product_id: i.id, quantity: i.quantity })),
            { onConflict: "user_id,product_id" },
          );
          if (upsertErr) console.error("[cart] reconcile error:", upsertErr.message);
        }
      },
    }),
    {
      name: "cart",
      partialize: (state) => ({ items: state.items }),
    },
  ),
);
