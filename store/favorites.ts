import { create } from "zustand";

type FavoritesStore = {
  ids: number[];
  loaded: boolean;
  load: () => Promise<void>;
  add: (id: number) => void;
  remove: (id: number) => void;
  reset: () => void;
};

export const useFavorites = create<FavoritesStore>((set, get) => ({
  ids: [],
  loaded: false,

  load: async () => {
    if (get().loaded) return;

    const { createClient } = await import("@/lib/supabase-browser");
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      set({ loaded: true });
      return;
    }

    const { data } = await supabase.from("favorites").select("product_id").eq("user_id", user.id);
    set({
      ids: (data || []).map((f: { product_id: number }) => f.product_id),
      loaded: true,
    });
  },

  add: (id) => set((state) => ({ ids: [...state.ids, id] })),
  remove: (id) =>
    set((state) => ({
      ids: state.ids.filter((i) => i !== id),
    })),
  reset: () => set({ ids: [], loaded: false }),
}));
