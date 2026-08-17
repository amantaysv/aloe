"use client";

import { useEffect } from "react";
import { createClient } from "@/lib/supabase-browser";
import { useCart } from "@/store/cart";
import { useFavorites } from "@/store/favorites";

export default function AuthSync() {
  const setCartUser = useCart((s) => s.setUser);
  const setFavoritesUser = useFavorites((s) => s.setUser);

  useEffect(() => {
    const supabase = createClient();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        setCartUser(session.user.id);
        setFavoritesUser(session.user.id);
        return;
      }

      // No session. Favourites hold nothing worth preserving, so settle them either way —
      // otherwise `initialized` never flips for a guest and FavoriteButton stays disabled.
      setFavoritesUser(null);

      // The cart persists to localStorage for guests, so only a real sign-out may clear it.
      // INITIAL_SESSION also arrives with a null session and must not wipe it.
      if (event === "SIGNED_OUT") setCartUser(null);
    });

    return () => subscription.unsubscribe();
  }, [setCartUser, setFavoritesUser]);

  return null;
}
