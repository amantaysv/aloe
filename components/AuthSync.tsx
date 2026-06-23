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
      } else if (event === "SIGNED_OUT") {
        setCartUser(null);
        setFavoritesUser(null);
      }
    });

    return () => subscription.unsubscribe();
  }, [setCartUser, setFavoritesUser]);

  return null;
}
