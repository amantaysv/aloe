"use client";

import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { LogInIcon, User as UserIcon } from "lucide-react";
import Link from "next/link";
import { createClient } from "@/lib/supabase-browser";

export default function AuthButton() {
  const [user, setUser] = useState<User | null>(null);
  const supabase = createClient();

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user));

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (user) {
    return (
      <Link
        href="/profile"
        title={user.email ?? "Профиль"}
        className="p-2 rounded-full flex items-center justify-center text-gray-400 hover:text-green-600 transition-colors"
      >
        <UserIcon className="size-5" />
      </Link>
    );
  }

  return (
    <Link
      href="/auth"
      title="Войти"
      className="p-2 rounded-full flex items-center justify-center text-gray-400 hover:text-green-600 transition-colors"
    >
      <LogInIcon />
    </Link>
  );
}
