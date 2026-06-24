"use client";

import cn from "clsx";
import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS = [
  { label: "Заказы", href: "/admin/orders" },
  { label: "Товары", href: "/admin/products" },
  { label: "Категории", href: "/admin/categories" },
  { label: "Бренды", href: "/admin/brands" },
  { label: "Баннеры", href: "/admin/banners" },
];

export default function AdminNav() {
  const pathname = usePathname();
  return (
    <div className="flex gap-1 mb-6 border-b border-gray-200">
      {TABS.map((t) => (
        <Link
          key={t.href}
          href={t.href}
          className={cn(
            "px-4 py-2 text-sm font-medium -mb-px border-b-2",
            pathname.startsWith(t.href)
              ? "border-green-600 text-green-600"
              : "border-transparent text-gray-500 hover:text-gray-700",
          )}
        >
          {t.label}
        </Link>
      ))}
    </div>
  );
}
