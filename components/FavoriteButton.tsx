"use client";

import { useEffect } from "react";
import { Heart } from "lucide-react";
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
      await supabase.from("favorites").insert({
        user_id: user.id,
        product_id: productId,
      });
      show("Добавлено в избранное", "success");
    }
  }

  return (
    <button
      onClick={toggle}
      title={isFav ? "Убрать из избранного" : "В избранное"}
      className={`absolute top-2 right-2 w-8 h-8 flex items-center justify-center rounded-full transition-colors hover:cursor-pointer
        ${isFav ? "bg-red-50 text-red-500 hover:bg-red-100" : "bg-white/80 text-gray-400 hover:text-red-400 hover:bg-white"}`}
    >
      <Heart className="w-4 h-4" fill={isFav ? "currentColor" : "none"} />
    </button>
  );
}
