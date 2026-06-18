"use client";

import { useCart } from "@/store/cart";
import { useToast } from "@/store/toast";

type Props = {
  product: {
    id: number;
    name: string;
    price: number;
    image_url: string;
  };
};

export default function AddToCart({ product }: Props) {
  const { add, items, increment, decrement, remove } = useCart();
  const { show } = useToast();
  const item = items.find((i) => i.id === product.id);

  if (item) {
    return (
      <div className="flex items-center gap-2 mt-2">
        <button onClick={() => decrement(product.id)} className="w-8 h-8 border rounded-lg text-lg font-bold hover:bg-gray-50 flex items-center justify-center">
          −
        </button>
        <span className="text-sm font-medium w-6 text-center">{item.quantity}</span>
        <button onClick={() => increment(product.id)} className="w-8 h-8 border rounded-lg text-lg font-bold hover:bg-gray-50 flex items-center justify-center">
          +
        </button>
        <button onClick={() => remove(product.id)} className="text-xs text-red-400 hover:text-red-600 ml-1">
          удалить
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => { add(product); show("Добавлено в корзину", "success"); }}
      className="mt-2 w-full bg-green-600 text-white text-sm font-medium py-1.5 rounded-lg hover:bg-green-700 transition-colors"
    >
      В корзину
    </button>
  );
}
