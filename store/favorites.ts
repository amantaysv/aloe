import { create } from "zustand";

type FavoritesStore = {
  ids: number[];
  userId: string | null;
  add: (id: number) => void;
  remove: (id: number) => void;
  setUser: (userId: string | null) => Promise<void>;
};

async function getSupabase() {
  const { createClient } = await import("@/lib/supabase-browser");
  return createClient();
}

export const useFavorites = create<FavoritesStore>((set, get) => ({
  ids: [],
  userId: null,

  add: (id) => {
    set((state) => ({ ids: [...state.ids, id] }));
    const { userId } = get();
    if (userId) {
      getSupabase()
        .then((sb) => sb.from("favorites").insert({ user_id: userId, product_id: id }))
        .then(({ error }) => {
          if (error) console.error("[favorites] add error:", error.message);
        });
    }
  },

  remove: (id) => {
    set((state) => ({ ids: state.ids.filter((i) => i !== id) }));
    const { userId } = get();
    if (userId) {
      getSupabase()
        .then((sb) => sb.from("favorites").delete().eq("user_id", userId).eq("product_id", id))
        .then(({ error }) => {
          if (error) console.error("[favorites] remove error:", error.message);
        });
    }
  },

  setUser: async (userId) => {
    if (!userId) {
      set({ userId: null, ids: [] });
      return;
    }

    set({ userId });

    const supabase = await getSupabase();
    const { data, error } = await supabase.from("favorites").select("product_id").eq("user_id", userId);

    if (error) {
      console.error("[favorites] load error:", error.message);
      return;
    }

    set({ ids: (data ?? []).map((f: { product_id: number }) => f.product_id) });
  },
}));
