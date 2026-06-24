"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Button from "@/components/Button";
import { useCart } from "@/store/cart";
import { createOrder } from "./actions";

type Props = {
  initial?: {
    name: string;
    phone: string;
    address: string;
  };
};

export default function CheckoutForm({ initial }: Props) {
  const router = useRouter();
  const { items, total, clear } = useCart();
  const [name, setName] = useState(initial?.name ?? "");
  const [phone, setPhone] = useState(initial?.phone ?? "");
  const [address, setAddress] = useState(initial?.address ?? "");
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (items.length === 0) {
    return (
      <div className="text-center py-16 text-gray-500">
        <p className="text-lg">Корзина пуста</p>
        <Link href="/" className="text-green-600 text-sm mt-2 inline-block hover:underline">
          Перейти в каталог
        </Link>
      </div>
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !phone.trim() || !address.trim()) {
      setError("Заполните все обязательные поля");
      return;
    }
    setLoading(true);
    setError("");
    const result = await createOrder({
      name: name.trim(),
      phone: phone.trim(),
      address: address.trim(),
      comment: comment.trim(),
      items: items.map((i) => ({
        id: i.id,
        name: i.name,
        price: i.price,
        quantity: i.quantity,
        image_url: i.image_url,
      })),
      total: total(),
    });
    if (!result.ok) {
      setError(result.error);
      setLoading(false);
      return;
    }
    clear();
    router.push(`/checkout/success?id=${result.orderId}`);
  }

  const orderTotal = total();
  const freeDelivery = orderTotal >= 5000;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Cart summary */}
      <div className="border border-gray-300 rounded-lg p-4 bg-gray-50">
        <h2 className="font-semibold mb-3">Ваш заказ</h2>
        <div className="space-y-2">
          {items.map((item) => (
            <div key={item.id} className="flex items-center gap-3">
              <div className="relative w-10 h-10 shrink-0 bg-white rounded border">
                <Image src={item.image_url} alt={item.name} fill className="object-contain p-0.5" />
              </div>
              <p className="flex-1 text-sm line-clamp-1">{item.name}</p>
              <p className="text-sm shrink-0 text-gray-600">
                {item.quantity} × {item.price} сом
              </p>
            </div>
          ))}
        </div>
        <div className="border-t border-gray-300 mt-3 pt-3 flex justify-between font-bold">
          <span>Итого:</span>
          <span className="text-green-600">{orderTotal} сом</span>
        </div>
        <div className="mt-2 text-sm text-gray-500">
          Доставка:{" "}
          {freeDelivery ? <span className="text-green-600 font-medium">бесплатно 🎉</span> : <span>150 сом</span>}
        </div>
      </div>

      {/* Delivery info */}
      <div className="space-y-4">
        <h2 className="font-semibold">Данные для доставки</h2>

        <div>
          <label className="text-sm text-gray-600 block mb-1">Имя *</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            placeholder="Ваше имя"
          />
        </div>

        <div>
          <label className="text-sm text-gray-600 block mb-1">Телефон *</label>
          <input
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            type="tel"
            className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            placeholder="+996 700 000 000"
          />
        </div>

        <div>
          <label className="text-sm text-gray-600 block mb-1">Адрес доставки *</label>
          <input
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            placeholder="Улица, дом, квартира"
          />
        </div>

        <div>
          <label className="text-sm text-gray-600 block mb-1">Комментарий</label>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
            rows={2}
            placeholder="Дополнительная информация, ориентиры..."
          />
        </div>
      </div>

      {error && <p className="text-red-500 text-sm bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</p>}

      <Button type="submit" variant="primary" size="md" disabled={loading} className="w-full py-2.5 md:py-3">
        {loading ? "Оформляем..." : "Подтвердить заказ"}
      </Button>
    </form>
  );
}
