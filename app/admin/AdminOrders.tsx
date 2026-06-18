"use client";

import { useState } from "react";
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
  items: { name: string; quantity: number; price: number }[];
};

const STATUS: Record<string, { label: string; cls: string }> = {
  new:        { label: "Новый",       cls: "bg-blue-100 text-blue-700" },
  confirmed:  { label: "Подтверждён", cls: "bg-yellow-100 text-yellow-700" },
  processing: { label: "В доставке",  cls: "bg-orange-100 text-orange-700" },
  delivered:  { label: "Доставлен",   cls: "bg-green-100 text-green-700" },
  cancelled:  { label: "Отменён",     cls: "bg-red-100 text-red-700" },
};

const PAGE_SIZE = 15;

export default function AdminOrders({ orders: initial }: { orders: Order[] }) {
  const [orders, setOrders] = useState(initial);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<Set<string>>(new Set());
  const [page, setPage] = useState(1);

  function handleStatusChange(orderId: number, status: string) {
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status } : o))
    );
  }

  function toggleStatus(key: string) {
    setStatusFilter((prev) => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });
    setPage(1);
  }

  const q = query.trim().toLowerCase();
  const filtered = orders.filter((o) => {
    const matchesQuery =
      !q ||
      o.customer_name?.toLowerCase().includes(q) ||
      o.customer_phone?.toLowerCase().includes(q);
    const matchesStatus = statusFilter.size === 0 || statusFilter.has(o.status);
    return matchesQuery && matchesStatus;
  });

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const counts = Object.fromEntries(
    Object.keys(STATUS).map((s) => [s, orders.filter((o) => o.status === s).length])
  );

  return (
    <>
      {/* Status badges / filters */}
      <div className="flex gap-2 flex-wrap mb-5">
        {Object.entries(STATUS).map(([key, { label, cls }]) => {
          const active = statusFilter.has(key);
          return (
            <button
              key={key}
              type="button"
              onClick={() => toggleStatus(key)}
              className={`text-xs font-medium px-2 py-1 rounded transition-all ${cls} ${
                active
                  ? "ring-2 ring-offset-1 ring-current"
                  : "opacity-70 hover:opacity-100"
              }`}
            >
              {label}: {counts[key]}
            </button>
          );
        })}
        {statusFilter.size > 0 && (
          <button
            type="button"
            onClick={() => setStatusFilter(new Set())}
            className="text-xs text-gray-400 hover:text-gray-600 px-2 py-1"
          >
            Сбросить ✕
          </button>
        )}
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <svg
          className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
          fill="none" stroke="currentColor" strokeWidth={2}
          viewBox="0 0 24 24"
        >
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.35-4.35" />
        </svg>
        <input
          type="text"
          value={query}
          onChange={(e) => { setQuery(e.target.value); setPage(1); }}
          placeholder="Поиск по имени или телефону..."
          className="w-full border rounded-lg pl-9 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
        />
        {query && (
          <button
            onClick={() => setQuery("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
        )}
      </div>

      {filtered.length === 0 && (
        <p className="text-gray-400 text-sm">
          {q ? `Ничего не найдено по запросу «${query}»` : "Заказов пока нет"}
        </p>
      )}

      <div className="space-y-4">
        {paginated.map((order) => {
          const date = new Date(order.created_at).toLocaleString("ru-RU", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          });

          return (
            <div key={order.id} className="border rounded-lg p-4 hover:shadow-sm transition-shadow">
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div className="space-y-0.5">
                  <p className="font-mono text-xs text-gray-400">#{order.id}</p>
                  <p className="text-xs text-gray-400">{date}</p>
                  <p className="font-semibold mt-1">{order.customer_name ?? "—"}</p>
                  <p className="text-sm text-gray-600">{order.customer_phone ?? "—"}</p>
                  <p className="text-sm text-gray-600">{order.customer_address ?? "—"}</p>
                  {order.comment && (
                    <p className="text-sm text-gray-400 italic">💬 {order.comment}</p>
                  )}
                </div>
                <div className="text-right shrink-0">
                  <p className="text-xl font-bold text-green-600">{order.total} сом</p>
                  <OrderStatusSelect orderId={order.id} currentStatus={order.status} onStatusChange={handleStatusChange} />
                </div>
              </div>

              <div className="mt-3 border-t pt-3">
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

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-1 mt-6">
          <button
            onClick={() => setPage((p) => p - 1)}
            disabled={page === 1}
            className="px-3 py-1.5 text-sm border rounded-lg disabled:opacity-40 hover:bg-gray-50"
          >
            ←
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              onClick={() => setPage(p)}
              className={`px-3 py-1.5 text-sm border rounded-lg ${
                p === page ? "bg-green-600 text-white border-green-600" : "hover:bg-gray-50"
              }`}
            >
              {p}
            </button>
          ))}
          <button
            onClick={() => setPage((p) => p + 1)}
            disabled={page === totalPages}
            className="px-3 py-1.5 text-sm border rounded-lg disabled:opacity-40 hover:bg-gray-50"
          >
            →
          </button>
        </div>
      )}
    </>
  );
}
