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
  large?: boolean;
};

export default function AddToCart({ product, large }: Props) {
  const { add, items, increment, decrement, remove } = useCart();
  const { show } = useToast();
  const item = items.find((i) => i.id === product.id);

  const btnSz = large ? "w-10 h-10 text-xl" : "w-8 h-8 text-lg";

  if (item) {
    return (
      <div className={`flex items-center gap-2 ${large ? "" : "mt-2"}`}>
        <button
          onClick={() => decrement(product.id)}
          className={`${btnSz} border rounded-lg font-bold hover:bg-gray-50 flex items-center justify-center`}
        >
          −
        </button>
        <span className={`${large ? "text-base" : "text-sm"} font-medium w-6 text-center`}>{item.quantity}</span>
        <button
          onClick={() => increment(product.id)}
          className={`${btnSz} border rounded-lg font-bold hover:bg-gray-50 flex items-center justify-center`}
        >
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
      onClick={() => {
        add(product);
        show("Добавлено в корзину", "success");
      }}
      className={`w-full bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors ${
        large ? "py-3 text-base" : "mt-2 py-1.5 text-sm"
      }`}
    >
      В корзину
    </button>
  );
}
