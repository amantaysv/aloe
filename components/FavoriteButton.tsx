"use client";

import { Heart } from "lucide-react";
import { useRouter } from "next/navigation";
import { useFavorites } from "@/store/favorites";
import { useToast } from "@/store/toast";
import Button from "./Button";

export default function FavoriteButton({ productId }: { productId: number }) {
  const isFav = useFavorites((s) => s.ids.includes(productId));
  const userId = useFavorites((s) => s.userId);
  const add = useFavorites((s) => s.add);
  const remove = useFavorites((s) => s.remove);
  const show = useToast((s) => s.show);
  const router = useRouter();

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
      className={`absolute top-2 right-2 w-8 h-8 flex items-center justify-center rounded-full transition-colors z-9
        ${isFav ? "md:bg-red-50 text-red-500 md:hover:bg-red-100" : "md:bg-white/80 text-gray-400 hover:text-red-400 md:hover:bg-white"}`}
    >
      <Heart className="size-6 md:size-4" fill={isFav ? "currentColor" : "none"} />
    </Button>
  );
}
