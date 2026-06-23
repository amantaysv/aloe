"use client";

import { useEffect, useRef, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { LogInIcon, LogOut, User as UserIcon } from "lucide-react";
import Link from "next/link";
import { createClient } from "@/lib/supabase-browser";
import Button from "@/components/Button";

export default function AuthButton() {
  const [user, setUser] = useState<User | null>(null);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
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

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  async function signOut() {
    setOpen(false);
    await supabase.auth.signOut();
    setUser(null);
  }

  if (user) {
    return (
      <div ref={ref} className="relative">
        <Button
          onClick={() => setOpen((v) => !v)}
          title={user.email ?? "Профиль"}
          className={`p-2 rounded-full flex items-center justify-center transition-colors ${
            open ? "bg-green-50 text-green-600" : "text-gray-400 hover:text-green-600"
          }`}
        >
          <UserIcon className="size-5" />
        </Button>

        {open && (
          <div className="absolute right-0 top-full mt-2 w-44 bg-white border border-gray-100 rounded-xl shadow-lg py-1 z-50">
            <p className="px-3 py-1.5 text-xs text-gray-400 truncate">{user.email}</p>
            <div className="border-t border-gray-100 my-1" />
            <Link
              href="/profile"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
            >
              <UserIcon className="size-4 text-gray-400" />
              Профиль
            </Link>
            <Button
              onClick={signOut}
              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-500 hover:bg-red-50"
            >
              <LogOut className="size-4" />
              Выйти
            </Button>
          </div>
        )}
      </div>
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
