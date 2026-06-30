"use client";

import { MinusIcon, PlusIcon, Trash2Icon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button, Container, Currency, MobileHeader, Title } from "@/components";
import MainContainer from "@/components/MainContainer";
import { useCart } from "@/store/cart";

export default function CartPage() {
  const router = useRouter();
  const { items, increment, decrement, total, clear } = useCart();

  if (items.length === 0) {
    return (
      <>
        <MobileHeader>
          <Title className="text-center">Корзина</Title>
        </MobileHeader>
        <Container className="text-center py-16 pt-28">
          <p className="text-gray-500 text-lg">Корзина пуста</p>
          <Link href="/" className="text-green-600 text-sm mt-2 inline-block hover:underline">
            Перейти в каталог
          </Link>
        </Container>
      </>
    );
  }

  return (
    <>
      <MobileHeader>
        <div className="flex items-center">
          <Title className="flex-1 text-center">Корзина</Title>
          <Button variant="ghost" size="md" onClick={clear} className="absolute right-4">
            Очистить
          </Button>
        </div>
      </MobileHeader>
      <MainContainer className="pb-40 md:pb-20">
        <Title className="hidden md:block mb-6">Корзина</Title>
        <div className="flex flex-col md:gap-3">
          {items.map((item) => (
            <div
              key={item.id}
              className="flex items-center gap-2 md:gap-4 border-b md:border border-gray-300 md:rounded-lg p-2 md:p-3"
            >
              <div className="relative size-16 md:size-20 shrink-0 bg-gray-50 rounded">
                <Image
                  src={item.image_url}
                  alt={item.name}
                  fill
                  sizes="(max-width: 768px) 56px, 64px"
                  className="object-contain p-1"
                />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium line-clamp-3 mb-1">{item.name}</p>
                <div className="flex justify-between items-center">
                  <p className="text-sm text-green-600 font-medium md:font-bold">
                    {item.price} <Currency />
                  </p>
                  <div className="flex items-center gap-1 md:gap-2 shrink-0 rounded-full bg-gray-200">
                    <Button
                      variant="icon"
                      size="sm"
                      onClick={() => decrement(item.id)}
                      className="md:border border-gray-300"
                    >
                      {item.quantity === 1 ? <Trash2Icon className="size-4" /> : <MinusIcon className="size-4" />}
                    </Button>
                    <span className="w-6 text-center text-sm">{item.quantity}</span>
                    <Button
                      variant="icon"
                      size="sm"
                      onClick={() => increment(item.id)}
                      className="md:border border-gray-300"
                    >
                      <PlusIcon className="size-4" />
                    </Button>
                  </div>
                </div>
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
          <div className="hidden md:flex flex-wrap gap-3">
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

          <div className="md:hidden fixed bottom-20 left-0 right-0 px-8 flex">
            <Button variant="primary" size="lg" onClick={() => router.push("/checkout")} className="min-w-40 flex-1">
              Оформить заказ
            </Button>
          </div>
        </div>
      </MainContainer>
    </>
  );
}
