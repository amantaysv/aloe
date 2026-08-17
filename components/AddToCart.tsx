"use client";

import { useCart } from "@/store/cart";
import { useToast } from "@/store/toast";
import Button from "./Button";
import QuantityStepper from "./QuantityStepper";

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
  const item = useCart((s) => s.items.find((i) => i.id === product.id));
  const add = useCart((s) => s.add);
  const increment = useCart((s) => s.increment);
  const decrement = useCart((s) => s.decrement);
  const show = useToast((s) => s.show);

  if (item) {
    return (
      <QuantityStepper
        quantity={item.quantity}
        onDecrement={() => decrement(product.id)}
        onIncrement={() => increment(product.id)}
        label={product.name}
        size={size}
      />
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
