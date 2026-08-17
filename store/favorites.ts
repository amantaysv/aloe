import { create } from "zustand";
import { addFavorite, loadFavoriteIds, removeFavorite } from "@/services/favorites.service";

type FavoritesStore = {
  ids: number[];
  userId: string | null;
  /** False until the first auth event has been handled, so the UI can avoid guessing. */
  initialized: boolean;
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
  initialized: false,

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
      set({ userId: null, ids: [], initialized: true });
      return;
    }

    // onAuthStateChange fires for INITIAL_SESSION, SIGNED_IN, hourly TOKEN_REFRESHED and on tab
    // focus; reloading the same user's favourites on each of those is pure waste.
    if (get().userId === userId && get().initialized) return;

    set({ userId });

    const supabase = await getSupabase();
    const ids = await loadFavoriteIds(supabase, userId);
    set({ ids, initialized: true });
  },
}));
