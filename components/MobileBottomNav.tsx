"use client";

import { useEffect, useState } from "react";
import { Heart, Home, Search, ShoppingCart, User } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCart } from "@/store/cart";

const items = [
  { href: "/", icon: Home, label: "Главная" },
  { href: "/search", icon: Search, label: "Поиск" },
  { href: "/cart", icon: ShoppingCart, label: "Корзина", showBadge: true },
  { href: "/favorites", icon: Heart, label: "Избранное" },
  { href: "/profile", icon: User, label: "Профиль" },
];

export default function MobileBottomNav() {
  const pathname = usePathname();
  const count = useCart((s) => s.count());
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-40 lg:hidden safe-area-pb">
      <div className="flex items-center justify-around h-14">
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          const badge = item.showBadge && mounted && count > 0 ? count : 0;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`relative flex flex-col items-center justify-center gap-0.5 flex-1 py-1 transition-colors ${
                isActive ? "text-green-600" : "text-gray-500"
              }`}
            >
              <div className="relative">
                <Icon className="size-5" />
                {badge > 0 && (
                  <span className="absolute -top-2 -right-2 bg-green-600 text-white text-[10px] font-semibold rounded-full w-4 h-4 flex items-center justify-center">
                    {badge > 9 ? "9+" : badge}
                  </span>
                )}
              </div>
              <span className="text-[10px] leading-tight">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
