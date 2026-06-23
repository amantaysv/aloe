"use client";

import { useEffect } from "react";
import { createClient } from "@/lib/supabase-browser";
import { useCart } from "@/store/cart";

export default function CartSync() {
  const setUser = useCart((s) => s.setUser);

  useEffect(() => {
    const supabase = createClient();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        setUser(session.user.id);
      } else if (event === "SIGNED_OUT") {
        setUser(null);
      }
    });

    return () => subscription.unsubscribe();
  }, [setUser]);

  return null;
}
