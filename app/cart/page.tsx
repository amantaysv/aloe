"use client";

import { useCart } from "@/store/cart";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function CartPage() {
  const router = useRouter();
  const { items, increment, decrement, remove, total, clear } = useCart();

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
          <div key={item.id} className="flex items-center gap-4 border rounded-lg p-3">
            <div className="relative w-16 h-16 shrink-0 bg-gray-50 rounded">
              <Image src={item.image_url} alt={item.name} fill className="object-contain p-1" unoptimized />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium line-clamp-2">{item.name}</p>
              <p className="text-sm text-green-600 font-bold mt-1">{item.price} сом</p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button onClick={() => decrement(item.id)} className="w-8 h-8 border rounded-lg hover:bg-gray-50 flex items-center justify-center font-bold">
                −
              </button>
              <span className="w-6 text-center text-sm">{item.quantity}</span>
              <button onClick={() => increment(item.id)} className="w-8 h-8 border rounded-lg hover:bg-gray-50 flex items-center justify-center font-bold">
                +
              </button>
              <button onClick={() => remove(item.id)} className="text-red-400 hover:text-red-600 ml-2 text-xs">
                удалить
              </button>
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
          <button onClick={clear} className="px-4 py-2 border rounded-lg text-sm text-gray-500 hover:bg-gray-50">
            Очистить
          </button>
          <button
            onClick={() => router.push("/checkout")}
            className="px-6 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700"
          >
            Оформить заказ
          </button>
        </div>
      </div>
    </main>
  );
}
