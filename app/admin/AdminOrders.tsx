"use client";

import { useRef, useState } from "react";
import { Search, X } from "lucide-react";
import { useRouter } from "next/navigation";
import Button from "@/components/Button";
import Pagination from "@/components/Pagination";
import OrderStatusSelect from "./OrderStatusSelect";

type Order = {
  id: number;
  created_at: string;
  total: number;
  status: string;
  customer_name: string | null;
  customer_phone: string | null;
  customer_address: string | null;
  comment: string | null;
  items: {
    name: string;
    quantity: number;
    price: number;
  }[];
};

const STATUS: Record<string, { label: string; cls: string }> = {
  new: { label: "Новый", cls: "bg-blue-100 text-blue-700" },
  confirmed: { label: "Подтверждён", cls: "bg-yellow-100 text-yellow-700" },
  processing: { label: "В доставке", cls: "bg-orange-100 text-orange-700" },
  delivered: { label: "Доставлен", cls: "bg-green-100 text-green-700" },
  cancelled: { label: "Отменён", cls: "bg-red-100 text-red-700" },
};

type Props = {
  orders: Order[];
  page: number;
  totalPages: number;
  total: number;
  q: string;
  statusFilter: string;
  statusCounts: Record<string, number>;
};

export default function AdminOrders({
  orders: initial,
  page,
  totalPages,
  total,
  q,
  statusFilter,
  statusCounts,
}: Props) {
  const router = useRouter();
  const [localStatus, setLocalStatus] = useState<Record<number, string>>({});
  const [searchInput, setSearchInput] = useState(q);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const orders = initial.map((o) => ({ ...o, status: localStatus[o.id] ?? o.status }));

  const activeStatuses = new Set(statusFilter ? statusFilter.split(",") : []);

  function navigate(updates: { q?: string; status?: string; page?: number }) {
    const params = new URLSearchParams(window.location.search);
    if ("q" in updates) {
      if (updates.q) params.set("q", updates.q!);
      else params.delete("q");
      params.delete("page");
    }
    if ("status" in updates) {
      if (updates.status) params.set("status", updates.status!);
      else params.delete("status");
      params.delete("page");
    }
    if ("page" in updates) {
      if (updates.page && updates.page > 1) params.set("page", String(updates.page));
      else params.delete("page");
    }
    router.replace(`?${params.toString()}`);
  }

  function handleSearch(value: string) {
    setSearchInput(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => navigate({ q: value }), 400);
  }

  function toggleStatus(key: string) {
    const next = new Set(activeStatuses);
    if (next.has(key)) next.delete(key);
    else next.add(key);
    navigate({ status: [...next].join(",") });
  }

  function handleStatusChange(orderId: number, status: string) {
    setLocalStatus((prev) => ({ ...prev, [orderId]: status }));
  }

  return (
    <>
      {/* Status badges / filters */}
      <div className="flex gap-2 flex-wrap mb-5">
        {Object.entries(STATUS).map(([key, { label, cls }]) => {
          const active = activeStatuses.has(key);
          return (
            <Button
              key={key}
              type="button"
              onClick={() => toggleStatus(key)}
              className={`text-xs font-medium px-2 py-1 rounded transition-all ${cls} ${
                active ? "ring-2 ring-offset-1 ring-current" : "opacity-70 hover:opacity-100"
              }`}
            >
              {label}: {statusCounts[key] ?? 0}
            </Button>
          );
        })}
        {activeStatuses.size > 0 && (
          <Button
            type="button"
            onClick={() => navigate({ status: "" })}
            className="text-xs text-gray-400 hover:text-gray-600 px-2 py-1"
          >
            Сбросить ✕
          </Button>
        )}
      </div>

      {/* Search */}
      <div className="relative mb-5">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          value={searchInput}
          onChange={(e) => handleSearch(e.target.value)}
          placeholder="Поиск по имени или телефону..."
          className="w-full border border-gray-300 rounded-lg pl-9 pr-9 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
        />
        {searchInput && (
          <Button
            onClick={() => {
              setSearchInput("");
              navigate({ q: "" });
            }}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <X className="w-4 h-4" />
          </Button>
        )}
      </div>

      <p className="text-sm text-gray-500 mb-4">Заказов: {total}</p>

      {orders.length === 0 && (
        <p className="text-gray-400 text-sm">{q ? `Ничего не найдено по запросу «${q}»` : "Заказов пока нет"}</p>
      )}

      <div className="space-y-4">
        {orders.map((order) => {
          const date = new Date(order.created_at).toLocaleString("ru-RU", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          });

          return (
            <div key={order.id} className="border border-gray-300 rounded-lg p-4 hover:shadow-sm transition-shadow">
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div className="space-y-0.5">
                  <p className="font-mono text-xs text-gray-400">#{order.id}</p>
                  <p className="text-xs text-gray-400">{date}</p>
                  <p className="font-semibold mt-1">{order.customer_name ?? "—"}</p>
                  <p className="text-sm text-gray-600">{order.customer_phone ?? "—"}</p>
                  <p className="text-sm text-gray-600">{order.customer_address ?? "—"}</p>
                  {order.comment && <p className="text-sm text-gray-400 italic">💬 {order.comment}</p>}
                </div>
                <div className="text-right shrink-0">
                  <p className="text-xl font-bold text-green-600">{order.total} сом</p>
                  <OrderStatusSelect
                    orderId={order.id}
                    currentStatus={order.status}
                    onStatusChange={handleStatusChange}
                  />
                </div>
              </div>

              <div className="mt-3 border-t border-gray-300 pt-3">
                <div className="space-y-1">
                  {(order.items || []).map((item, i) => (
                    <div key={i} className="flex justify-between text-sm">
                      <span className="text-gray-700 flex-1 line-clamp-1">{item.name}</span>
                      <span className="text-gray-500 shrink-0 ml-4">
                        {item.quantity} × {item.price} сом
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <Pagination page={page} totalPages={totalPages} onPageChange={(p) => navigate({ page: p })} />
    </>
  );
}
