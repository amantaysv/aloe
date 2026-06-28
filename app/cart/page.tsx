"use client";

import { MinusIcon, PlusIcon, Trash2Icon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Button from "@/components/Button";
import Currency from "@/components/Currency";
import MainContainer from "@/components/MainContainer";
import Title from "@/components/Title";
import { useCart } from "@/store/cart";

export default function CartPage() {
  const router = useRouter();
  const { items, increment, decrement, total, clear } = useCart();

  if (items.length === 0) {
    return (
      <MainContainer className="text-center py-16">
        <p className="text-gray-500 text-lg">Корзина пуста</p>
        <Link href="/" className="text-green-600 text-sm mt-2 inline-block hover:underline">
          Перейти в каталог
        </Link>
      </MainContainer>
    );
  }

  return (
    <MainContainer>
      <Title className="mb-6">Корзина</Title>
      <div className="flex flex-col md:gap-3">
        {items.map((item) => (
          <div
            key={item.id}
            className="flex items-center gap-2 md:gap-4 border-b md:border border-gray-300 md:rounded-lg p-2 md:p-3"
          >
            <div className="relative w-14 h-14 md:w-16 md:h-16 shrink-0 bg-gray-50 rounded">
              <Image src={item.image_url} alt={item.name} fill sizes="(max-width: 768px) 56px, 64px" className="object-contain p-1" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium line-clamp-2">{item.name}</p>
              <p className="text-sm text-green-600 font-bold mt-1">{item.price} сом</p>
            </div>
            <div className="flex items-center gap-1 md:gap-2 shrink-0">
              <Button variant="icon" size="sm" onClick={() => decrement(item.id)} className="md:border border-gray-300">
                {item.quantity === 1 ? <Trash2Icon className="size-4" /> : <MinusIcon className="size-4" />}
              </Button>
              <span className="w-6 text-center text-sm">{item.quantity}</span>
              <Button variant="icon" size="sm" onClick={() => increment(item.id)} className="md:border border-gray-300">
                <PlusIcon className="size-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 md:border-t md:pt-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-gray-500 text-sm">Итого:</p>
            <p className="text-2xl font-bold text-green-600">
              {total()} <Currency />
            </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button variant="secondary" onClick={clear} className="min-w-40 flex-1 shrink-0">
            Очистить
          </Button>
          <Button
            variant="primary"
            onClick={() => router.push("/checkout")}
            className="min-w-40 flex-1 sm:flex-none sm:px-6"
          >
            Оформить заказ
          </Button>
        </div>
      </div>
    </MainContainer>
  );
}
