import { create } from "zustand";
import { addFavorite, loadFavoriteIds, removeFavorite } from "@/services/favorites.service";

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
      getSupabase().then((sb) => addFavorite(sb, userId, id));
    }
  },

  remove: (id) => {
    set((state) => ({ ids: state.ids.filter((i) => i !== id) }));
    const { userId } = get();
    if (userId) {
      getSupabase().then((sb) => removeFavorite(sb, userId, id));
    }
  },

  setUser: async (userId) => {
    if (!userId) {
      set({ userId: null, ids: [] });
      return;
    }

    set({ userId });

    const supabase = await getSupabase();
    const ids = await loadFavoriteIds(supabase, userId);
    set({ ids });
  },
}));
