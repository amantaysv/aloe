"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase-browser";
import { useFavorites } from "@/store/favorites";
import { useToast } from "@/store/toast";

export default function FavoriteButton({ productId }: { productId: number }) {
  const { ids, load, add, remove } = useFavorites();
  const { show } = useToast();
  const router = useRouter();
  const isFav = ids.includes(productId);

  useEffect(() => {
    load();
  }, [load]);

  async function toggle(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();

    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      show("Войдите, чтобы добавить в избранное", "info");
      router.push("/auth");
      return;
    }

    if (isFav) {
      remove(productId);
      await supabase.from("favorites").delete().eq("user_id", user.id).eq("product_id", productId);
      show("Удалено из избранного", "info");
    } else {
      add(productId);
      await supabase.from("favorites").insert({ user_id: user.id, product_id: productId });
      show("Добавлено в избранное", "success");
    }
  }

  return (
    <button
      onClick={toggle}
      title={isFav ? "Убрать из избранного" : "В избранное"}
      className={`absolute top-2 right-2 w-8 h-8 flex items-center justify-center rounded-full transition-colors
        ${isFav ? "bg-red-50 text-red-500 hover:bg-red-100" : "bg-white/80 text-gray-400 hover:text-red-400 hover:bg-white"}`}
    >
      <svg viewBox="0 0 24 24" className="w-4.5 h-4.5" fill={isFav ? "currentColor" : "none"} stroke="currentColor" strokeWidth={2}>
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"
        />
      </svg>
    </button>
  );
}
