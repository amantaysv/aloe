"use client";

import { MinusIcon, PlusIcon, Trash2Icon } from "lucide-react";
import Button from "@/components/Button";
import { useCart } from "@/store/cart";
import { useToast } from "@/store/toast";

type Props = {
  product: {
    id: number;
    name: string;
    price: number;
    image_url: string;
  };
  size?: "sm" | "md" | "lg";
};

export default function AddToCart({ product, size }: Props) {
  const { add, items, increment, decrement } = useCart();
  const { show } = useToast();
  const item = items.find((i) => i.id === product.id);

  if (item) {
    return (
      <div className={`flex items-center justify-between gap-2`}>
        <Button
          onClick={() => decrement(product.id)}
          variant="icon"
          className={`border border-gray-300 rounded-lg font-bold hover:bg-gray-50`}
          size={size}
        >
          {item.quantity === 1 ? <Trash2Icon className="size-4" /> : <MinusIcon className="size-4" />}
        </Button>
        <span className={`${size === "lg" ? "text-base" : "text-sm"} font-medium w-6 text-center whitespace-nowrap`}>
          {`${item.quantity} шт`}
        </span>
        <Button
          onClick={() => increment(product.id)}
          variant="icon"
          className={`border border-gray-300 rounded-lg font-bold hover:bg-gray-50`}
          size={size}
        >
          <PlusIcon className="size-4" />
        </Button>
      </div>
    );
  }

  return (
    <Button
      variant="primary"
      onClick={() => {
        add(product);
        show("Добавлено в корзину", "success");
      }}
      className={`w-full`}
      size={size}
    >
      В корзину
    </Button>
  );
}
