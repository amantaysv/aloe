"use client";

import { useEffect, useState } from "react";
import { HandbagIcon, Heart, Home, ShoppingBasketIcon, User } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCart } from "@/store/cart";

const items = [
  { href: "/", icon: Home },
  { href: "/catalog", icon: HandbagIcon },
  { href: "/favorites", icon: Heart },
  { href: "/profile", icon: User },
];

export default function MobileBottomNav() {
  const pathname = usePathname();
  const count = useCart((s) => s.count());
  const [mounted, setMounted] = useState(false);

  const badge = mounted && count > 0 ? count : 0;

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 lg:hidden safe-area-pb pb-4 px-4">
      <div className="flex justify-center gap-2">
        <div className="flex items-center justify-around bg-white/50 rounded-full p-1 backdrop-blur-xs">
          {items.map((item) => {
            const Icon = item.icon;
            const isActive = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`relative flex flex-col items-center justify-center gap-0.5 flex-1 px-5 py-3 transition-colors text-green-600 rounded-full ${
                  isActive ? "bg-black/10" : ""
                }`}
              >
                <div className="relative">
                  <Icon className="size-6" />
                </div>
              </Link>
            );
          })}
        </div>

        <div className="flex items-center justify-around bg-white/50 rounded-full backdrop-blur-xs">
          <Link
            href="/cart"
            className={`relative flex flex-col items-center justify-center gap-0.5 flex-1 p-4 transition-colors text-green-600 rounded-full ${
              pathname === "/cart" ? "bg-black/10" : ""
            }`}
          >
            <div className="relative">
              <ShoppingBasketIcon className="size-6" />
              {badge > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {badge > 9 ? "9+" : badge}
                </span>
              )}
            </div>
          </Link>
        </div>
      </div>
    </nav>
  );
}
