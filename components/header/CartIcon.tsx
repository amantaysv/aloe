"use client";

import { useEffect, useState } from "react";
import { ShoppingCart } from "lucide-react";
import Link from "next/link";
import { useCart } from "@/store/cart";

export default function CartIcon() {
  const count = useCart((s) => s.count());
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  return (
    <Link href="/cart" className="relative flex items-center gap-1 p-2 text-sm text-gray-400 hover:text-green-600">
      <ShoppingCart className="size-5" />
      {mounted && count > 0 && (
        <span className="absolute -top-2 -right-2 bg-green-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
          {count}
        </span>
      )}
    </Link>
  );
}
