"use client";

import { useEffect, useState } from "react";

import type { User } from "@supabase/supabase-js";
import Link from "next/link";

import { createClient } from "@/lib/supabase-browser";
import { useFavorites } from "@/store/favorites";

export default function AuthButton() {
  const [user, setUser] = useState<User | null>(null);
  const supabase = createClient();
  const resetFavorites = useFavorites((s) => s.reset);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user));

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  async function signOut() {
    await supabase.auth.signOut();
    resetFavorites();
    setUser(null);
  }

  if (user) {
    return (
      <div className="flex items-center gap-3 text-sm">
        <Link href="/profile" className="text-gray-600 hover:text-green-600">
          {user.email?.split("@")[0]}
        </Link>
        <button onClick={signOut} className="text-gray-400 hover:text-red-500">
          Выйти
        </button>
      </div>
    );
  }

  return (
    <Link href="/auth" className="text-sm text-gray-600 hover:text-green-600">
      Войти
    </Link>
  );
}
