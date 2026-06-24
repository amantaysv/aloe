"use client";

import { Heart } from "lucide-react";
import { useRouter } from "next/navigation";
import Button from "@/components/Button";
import { useFavorites } from "@/store/favorites";
import { useToast } from "@/store/toast";

export default function FavoriteButton({ productId }: { productId: number }) {
  const { ids, userId, add, remove } = useFavorites();
  const { show } = useToast();
  const router = useRouter();
  const isFav = ids.includes(productId);

  function toggle(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();

    if (!userId) {
      show("Войдите, чтобы добавить в избранное", "info");
      router.push("/auth");
      return;
    }

    if (isFav) {
      remove(productId);
      show("Удалено из избранного", "info");
    } else {
      add(productId);
      show("Добавлено в избранное", "success");
    }
  }

  return (
    <Button
      onClick={toggle}
      title={isFav ? "Убрать из избранного" : "В избранное"}
      className={`absolute top-2 right-2 w-8 h-8 flex items-center justify-center rounded-full transition-colors
        ${isFav ? "bg-red-50 text-red-500 hover:bg-red-100" : "bg-white/80 text-gray-400 hover:text-red-400 hover:bg-white"}`}
    >
      <Heart className="w-4 h-4" fill={isFav ? "currentColor" : "none"} />
    </Button>
  );
}
