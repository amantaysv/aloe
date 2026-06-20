"use client";

import { useState } from "react";
import cn from "clsx";
import type { Product } from "@/types";
import AdminCategories from "./AdminCategories";
import AdminOrders from "./AdminOrders";
import AdminProducts from "./AdminProducts";

type Order = Parameters<typeof AdminOrders>[0]["orders"][number];
type Category = { id: string; name: string; parent_id: string | null };

const TABS = [
  { id: "orders", label: "Заказы" },
  { id: "products", label: "Товары" },
  { id: "categories", label: "Категории" },
] as const;

type Tab = (typeof TABS)[number]["id"];

function getInitialTab(): Tab {
  if (typeof window === "undefined") return "orders";
  const raw = new URLSearchParams(window.location.search).get("tab");
  return TABS.some((t) => t.id === raw) ? (raw as Tab) : "orders";
}

export default function AdminShell({
  orders,
  products,
  categories,
}: {
  orders: Order[];
  products: Product[];
  categories: Category[];
}) {
  const [tab, setTabState] = useState<Tab>(getInitialTab);

  function setTab(newTab: Tab) {
    setTabState(newTab);
    const params = new URLSearchParams(window.location.search);
    params.set("tab", newTab);
    params.delete("page");
    window.history.replaceState(null, "", `?${params.toString()}`);
  }

  return (
    <>
      <div className="flex gap-1 mb-6 border-b border-gray-200">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={cn(
              "px-4 py-2 text-sm font-medium  hover:cursor-pointer -mb-px border-b-2",
              tab === t.id ? "border-green-600 text-green-600" : "border-transparent text-gray-500 hover:text-gray-700"
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "orders" && <AdminOrders orders={orders} />}
      {tab === "products" && <AdminProducts products={products} />}
      {tab === "categories" && <AdminCategories categories={categories} products={products} />}
    </>
  );
}
