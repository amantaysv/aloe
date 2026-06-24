"use client";

import { MinusIcon, PlusIcon, Trash2Icon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Button from "@/components/Button";
import { useCart } from "@/store/cart";

export default function CartPage() {
  const router = useRouter();
  const { items, increment, decrement, total, clear } = useCart();

  if (items.length === 0) {
    return (
      <main className="text-center py-16">
        <p className="text-gray-500 text-lg">Корзина пуста</p>
        <Link href="/" className="text-green-600 text-sm mt-2 inline-block hover:underline">
          Перейти в каталог
        </Link>
      </main>
    );
  }

  return (
    <main>
      <h1 className="text-2xl font-bold mb-6">Корзина</h1>
      <div className="flex flex-col gap-3">
        {items.map((item) => (
          <div key={item.id} className="flex items-center gap-4 border border-gray-300 rounded-lg p-3">
            <div className="relative w-16 h-16 shrink-0 bg-gray-50 rounded">
              <Image src={item.image_url} alt={item.name} fill className="object-contain p-1" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium line-clamp-2">{item.name}</p>
              <p className="text-sm text-green-600 font-bold mt-1">{item.price} сом</p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <Button
                onClick={() => decrement(item.id)}
                className="w-8 h-8 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center justify-center font-bold"
              >
                {item.quantity === 1 ? <Trash2Icon className="size-4" /> : <MinusIcon className="size-4" />}
              </Button>
              <span className="w-6 text-center text-sm">{item.quantity}</span>
              <Button
                onClick={() => increment(item.id)}
                className="w-8 h-8 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center justify-center font-bold"
              >
                <PlusIcon className="size-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 flex items-center justify-between border-t pt-4">
        <div>
          <p className="text-gray-500 text-sm">Итого:</p>
          <p className="text-2xl font-bold text-green-600">{total()} сом</p>
        </div>
        <div className="flex gap-3">
          <Button variant="secondary" onClick={clear}>
            Очистить
          </Button>
          <Button variant="primary" onClick={() => router.push("/checkout")} className="px-6">
            Оформить заказ
          </Button>
        </div>
      </div>
    </main>
  );
}
